import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { CreateGraphDto } from './dto/create-graph.dto';
import { Graph } from './graph.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, EntityNotFoundError, In, Repository } from 'typeorm';
import { ParserService } from './parse/parser.service';
import { Neo4jEntry, lable, relation } from './graph.types';
import { PaginationSchema } from 'src/schema/pagination.schema';
import { updateGraphDto } from './dto/update-graph.dto';
import { title } from 'process';

@Injectable()
export class GraphService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly neo4jService: Neo4jService,
        @InjectRepository(Graph) private readonly graphRepository: Repository<Graph>,
    ) {}

    /**
     * Creates a new graph entity based on the provided data and saves it to the database.
     *
     * @param {CreateGraphDto} createGraphDto - The data to create the graph entity.
     * @returns {Promise<Graph>} A Promise that resolves to the created graph entity.
     */
    async createGraph(createGraphDto: CreateGraphDto): Promise<Graph> {
        // Create a new graph instance with the provided data
        const graph = new Graph(createGraphDto);

        // Save the graph entity to the database
        await this.graphRepository.save(graph);

        // Return the created graph
        return graph;
    }

    /**
     * Updates a graph with the provided data.
     *
     * @param id - The identifier of the graph to be updated.
     * @param updateGraphDto - The data to update the graph.
     * @returns The updated graph entity.
     * @throws NotFoundException if the specified graph is not found.
     */
    async updateGraph(id: string, updateGraphDto: updateGraphDto): Promise<Graph> {
        try {
            // Attempt to find the graph in the database by its ID
            const graph = await this.graphRepository.findOneByOrFail({ id });

            // Update the graph entity with the provided data
            updateGraphDto.title && (graph.title = updateGraphDto.title);
            updateGraphDto.description && (graph.description = updateGraphDto.description);
            updateGraphDto.isVisible && (graph.isVisible = updateGraphDto.isVisible);

            // Save the updated graph entity to the database
            await this.graphRepository.save(graph);

            // Return the updated graph entity
            return graph;
        } catch (error) {
            console.log(error);

            // Check if the error is an EntityNotFoundError
            if (error instanceof EntityNotFoundError) {
                // Throw a NotFoundException if the graph is not found
                throw new NotFoundException('Graph not found');
            } else {
                // Re-throw the error if it is not an EntityNotFoundError
                throw error;
            }
        }
    }

    /**
     * Finds a graph by its ID and retrieves associated nodes and relations based on optional labels.
     * 
     * @param id - The ID of the graph to find.
     * @param nodeLabels - Optional array of node labels to filter the result.
     * @param relationLabels - Optional array of relation labels to filter the result.
     * @returns A Promise resolving to a Graph object with associated nodes and relations.
     * @throws BadRequestException if there are missing or incorrect parameters in the Neo4j query.
     * @throws NotFoundException if the graph is not found.
     */
    async findById(id: string, nodeLabels?: lable[], relationLabels?: relation[]): Promise<Graph & {nodes: any[], relations: any[]}> {
        try {
            // Retrieve graph from the database
            const graph = await this.graphRepository.findOneByOrFail({ id });
    
            // Build node and relation label queries
            const labelsQuery = nodeLabels ? ':' + nodeLabels.map((label) => `${label}`).join('|') : "";
            const relationsQuery = relationLabels ? ':' + relationLabels.map((label) => `${label}`).join('|') : "";
    
            // Execute a Neo4j query to fetch nodes and relations
            const result = await this.neo4jService.read(
                `MATCH (n ${labelsQuery} {graphId: $graphId})-[r ${relationsQuery} {graphId: $graphId}]-(m ${labelsQuery} {graphId: $graphId})
                WITH COLLECT(DISTINCT n) as nodes, COLLECT(DISTINCT r) as relations
                RETURN nodes, relations`,
                {
                    graphId: id,
                }
            );
    
            // Extract nodes and relations from the Neo4j query result
            const nodes = result.records[0].get('nodes');
            const relations = result.records[0].get('relations');
    
            // Return the assembled object with graph, nodes, and relations
            return {
                ...graph,
                description: graph.description, // Adjust based on your actual graph structure
                nodes,
                relations,
            };
        } catch (error) {
            // Handle potential errors during the Neo4j read operation
            if (error.code === 'Neo.ClientError.Statement.ParameterMissing' || error.code === 'Neo.ClientError.Statement.SemanticError') {
                // Log and throw a BadRequestException for specific Neo4j errors
                console.error('Missing parameter error:', error);
                throw new BadRequestException('Missing parameter: ' + error.message);
            } if (error instanceof EntityNotFoundError) {
                // Throw a NotFoundException if the graph is not found
                throw new NotFoundException('Graph not found');
            } else {
                // Log and rethrow other errors
                console.error('Other error:', error);
                throw error;
            }
        }
    }

    /**
     * Retrieves a paginated list of graphs with optional visibility filter.
     * 
     * @param page - The page number (default: 1).
     * @param size - The number of items per page (default: 10).
     * @param includeNonVisible - Flag to include non-visible graphs (default: false).
     * @returns A Promise resolving to a PaginationSchema containing the list of graphs.
     */
    async find(page: number = 1, size: number = 10, includeNonVisible: boolean = false): Promise<PaginationSchema<Graph>> {
        // Define pagination options for TypeORM query
        const options = {
            skip: (page - 1) * size,
            take: size,
            where:{}
        }
        // Include visibility filter if includeNonVisible is false
        !includeNonVisible && (options['where']['isVisible'] = true);

        // Fetch graphs based on pagination options
        const graphs = await this.graphRepository.find(options);

        // Fetch total count of graphs (for pagination metadata)
        const count = await this.graphRepository.count();

        // Construct and return pagination result
        return {
            items: graphs,
            pages: Math.ceil(count/size),
            size,
            count,
        };
    }

    /**
     * Injects data into Neo4j graph based on the provided entries.
     * @param data - An array of Neo4jEntry objects representing the data to be injected.
     * @param graphId - The identifier for the graph in which the data should be injected.
     * @returns A Promise that resolves when the injection is complete.
     * @throws {BadRequestException} Throws an exception if there is a missing parameter or a semantic error in the Cypher query.
     */
    async injectData(file: Express.Multer.File, graphId: string, parser: ParserService): Promise<void> {
        try {
            // Delete existing nodes and relationships related to the specified graphId
            await this.neo4jService.write(
                `MATCH (n {graphId: $graphId})-[r {graphId: $graphId}]-(m {graphId: $graphId})
                DETACH DELETE n, r, m`,
                { graphId }
            );
            
            const data: Neo4jEntry[] = parser.parse(file);
            // Use Promise.all to concurrently execute Neo4j write operations for each entry in the data array
            console.log(data);
            for (const entry of data) {
                // Use the Neo4j service to execute a write operation
                await this.neo4jService.write(
                    // Merge nodes and relationship in Neo4j graph based on the provided entry
                    `MERGE (e1:${entry.label1} {name: $entity1, graphId: $graphId})
                    MERGE (e2:${entry.label2} {name: $entity2, graphId: $graphId})
                    MERGE (e1)-[r:${entry.relation} {score: $score, PMC_ID: $PMC_ID, sent_id: $sent_id, sentence: $sentence, graphId: $graphId}]-(e2)`,
                    {
                        // Parameters for the Cypher query, values provided by the current entry in the data array
                        entity1: entry.entity1,
                        entity2: entry.entity2,
                        score: entry.score,
                        PMC_ID: entry.PMC_ID,
                        sent_id: entry.sent_id,
                        sentence: entry.sentence,
                        graphId: graphId
                    }
                );
            }
    
            return;
        } catch (error) {
            // Handle potential errors during the Neo4j write operation
            if (error.code === 'Neo.ClientError.Statement.ParameterMissing' || error.code === 'Neo.ClientError.Statement.SemanticError') {
                // Log and throw a BadRequestException for specific Neo4j errors
                console.error('Missing parameter error:', error);
                throw new BadRequestException('Missing parameter: ' + error.message);
            } else {
                // Log and rethrow other errors
                console.error('Other error:', error);
                throw error;
            }
        }
    }
        
    /**
     * Deletes nodes and relationships from the Neo4j graph and corresponding entities from MySQL
     * based on the specified graph identifiers.
     * 
     * @param ids - An array of graph identifiers for data deletion.
     * @returns A Promise that resolves when the deletion is complete.
     * @throws BadRequestException if the array of graph IDs is empty.
     * @throws NotFoundException if a specified graph is not found for deletion.
     */
    async delete(ids: string[]): Promise<void> {
        try {
            // Check if the array of IDs is not empty
            if (ids.length === 0) {
                throw new BadRequestException('Array of graph IDs is empty');
            }

            // Use TypeORM transaction for atomic operations in MySQL and Neo4j
            await this.entityManager.transaction(async transactionalEntityManager => {
                // Delete the graph entities from MySQL (TypeORM)
                const result = await transactionalEntityManager.delete(Graph, { id: In(ids) });

                // Check if all specified graphs were found for deletion in MySQL
                if (result.affected !== ids.length) {
                    if (ids.length === 1) {
                        throw new NotFoundException('Specified graph was not found for deletion.');
                    }
                    throw new BadRequestException('Not all specified graphs were found for deletion.');
                }

                // Step 2: Delete the graph nodes and relationships from Neo4j
                await this.neo4jService.write(
                    `MATCH (n)-[r]-(m)
                    WHERE n.graphId IN $ids AND m.graphId IN $ids AND r.graphId IN $ids
                    DETACH DELETE n, r, m
                    `,
                    {
                        ids: ids
                    }
                );
            });

            return;
        } catch(error) {
            console.error('Error during deletion operation:', error);
            throw error;
        }
    }


}
