import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service';
import { CreateGraphDto } from './dto/create-graph.dto';
import { Graph } from './graph.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, EntityNotFoundError, In, Like, Raw, Repository } from 'typeorm';
import { ParserService } from './parse/parser.service';
import { Label, Neo4jEntry, Relation, isNeo4jEntry } from './graph.types';
import { PaginationSchema } from '../schema/pagination.schema';
import { UpdateGraphDto } from './dto/update-graph.dto';


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
    async updateGraph(id: string, updateGraphDto: UpdateGraphDto): Promise<Graph> {
        try {
            // Attempt to find the graph in the database by its ID
            const graph = await this.graphRepository.findOneByOrFail({ id });
            
            // Update the graph entity with the provided data
            updateGraphDto.title && (graph.title = updateGraphDto.title);
            updateGraphDto.description && (graph.description = updateGraphDto.description);
            (updateGraphDto.isVisible !== undefined) && (graph.isVisible = updateGraphDto.isVisible);

            // Save the updated graph entity to the database
            await this.graphRepository.save(graph);

            // Return the updated graph entity
            return graph;
        } catch (error) {
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
     * Builds parameters and options dynamically based on provided values.
     * 
     * @param {Record<string, any>} paramValues - Key-value pairs of parameter values.
     * @returns {Object} Object containing parameters query and options.
     */
    buildParamsAndOptions(paramValues: Record<string, any>): { paramsQuery: string, options: Record<string, any> } {
        // Build parameters query
        const paramsQuery = Object.entries(paramValues)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => `${key}: $${key}`)
            .join(', ');
    
        // Enclose parameters in curly braces to form a valid Cypher parameter block
        const paramsQueryBlock = `{${paramsQuery}}`;
    
        // Build options object
        const options = Object.fromEntries(Object.entries(paramValues).filter(([_, value]) => value !== undefined));
    
        return { paramsQuery: paramsQueryBlock, options };
    };

    /**
     * Finds a graph by its ID and retrieves associated nodes and relations based on optional labels.
     * 
     * @param {string} id - The ID of the graph to find.
     * @param {Label[]} [nodeLabels] - Optional array of node labels to filter the result.
     * @param {Relation[]} [relationLabels] - Optional array of relation labels to filter the result.
     * @param {string} [node] - Optional parameter to filter nodes by a specific property (e.g., "name").
     * @param {string} [pmcid] - Optional parameter to filter relations by a specific property (e.g., "PMC_ID").
     * @returns {Promise<Graph & {nodes: any[], relations: any[]}>} A Promise resolving to a Graph object with associated nodes and relations.
     * @throws {BadRequestException} if there are missing or incorrect parameters in the Neo4j query.
     * @throws {NotFoundException} if the graph is not found.
     */
    async findById(id: string, nodeLabels?: Label[], relationLabels?: Relation[], node?: string, pmcid?: string, sentenceid?: number): Promise<Graph & {nodes: any[], relations: any[]}> {
        try {
            // Retrieve graph from the database
            const graph = await this.graphRepository.findOneByOrFail({ id });

            // Build node and relation label queries
            const NodeslabelsQuery = nodeLabels ? Array.isArray(nodeLabels) ? ':' + nodeLabels.map((label) => `${label}`).join('|') : ':' + nodeLabels : "";
            const relationsTypeQuery = relationLabels ? Array.isArray(relationLabels) ? ':' + relationLabels.map((label) => `${label}`).join('|') : ":" + relationLabels : "";

            // Build the parameter queries and options for filtering nodes and relations
            const { paramsQuery: relationParamsQuery, options: relationOptions } = this.buildParamsAndOptions({ PMC_ID: pmcid, sent_id: sentenceid });
            const { paramsQuery: nodeParamsQuery, options: nodeOptions } = this.buildParamsAndOptions({ name: node });
        
            // Execute a Neo4j query to fetch nodes and relations
            const cypherQuery = `
                MATCH p=(${NodeslabelsQuery} ${nodeParamsQuery})-[r ${relationsTypeQuery} ${relationParamsQuery}]-(${NodeslabelsQuery})
                WITH DISTINCT nodes(p) AS distinctNodes, r AS relation
                UNWIND distinctNodes AS node
                RETURN COLLECT(DISTINCT node) AS nodes, COLLECT(DISTINCT relation) AS relations
            `;

            // Execute a Neo4j query to fetch nodes and relations
            const result = await this.neo4jService.read(cypherQuery, id, {...nodeOptions, ...relationOptions});

            // Extract nodes and relations from the Neo4j query result
            const nodes = result.records[0].get('nodes');
            const relations = result.records[0].get('relations');

            // Return the assembled object with graph, nodes, and relations
            return {
                ...graph,
                nodes,
                relations,
            };
        } catch (error) {
            // Handle potential errors during the Neo4j read operation
            if (error.code === 'Neo.ClientError.Statement.ParameterMissing' || error.code === 'Neo.ClientError.Statement.SemanticError') {
                // throw a BadRequestException for specific Neo4j errors
                throw new BadRequestException('Missing parameter: ' + error.message);
            } if (error instanceof EntityNotFoundError) {
                // Throw a NotFoundException if the graph is not found
                throw new NotFoundException('Graph not found');
            } else {
                // rethrow other errors
                throw error;
            }
        }
    }


    /**
     * Retrieves a paginated list of graphs with optional visibility and search filters.
     * 
     * @param page - The page number (default: 1).
     * @param size - The number of items per page (default: 10).
     * @param search - Optional search term to filter graphs by title (default: undefined).
     * @param includeNonVisible - Flag to include non-visible graphs (default: false).
     * @returns A Promise resolving to a PaginationSchema containing the list of graphs.
     */
    async find(page: number, size: number, search?: string, includeNonVisible: boolean = false): Promise<PaginationSchema<Graph>> {
        // Define pagination options for TypeORM query
        const options = {
            skip: (page - 1) * size,
            take: size,
            where: {},
        }

        // Include visibility filter if includeNonVisible is false
        !includeNonVisible && (options.where["isVisible"] = true);
        
        // Include search filter if search term is provided
        search && (options.where["title"] = Like(`%${search}%`));

        // Fetch graphs based on pagination options
        const graphs = await this.graphRepository.find(options);

        // Fetch total count of graphs (for pagination metadata)
        const count = await this.graphRepository.count({where: options.where});

        // Construct and return pagination result
        return {
            items: graphs,
            pages: Math.ceil(count / size),
            size,
            count,
        };
    }

    /**
     * Injects data into the Neo4j graph based on the provided entries.
     * @param {Express.Multer.File} file - The file containing data to be injected.
     * @param {string} graphId - The identifier for the Neo4j graph where the data should be injected.
     * @param {ParserService} parser - The parser service used to parse the file into Neo4jEntry objects.
     * @returns {Promise<void>} A Promise that resolves when the injection is complete.
     * @throws {BadRequestException} Throws an exception if there is a missing parameter or a semantic error in the Cypher query.
     */
    async injectData(file: Express.Multer.File, graphId: string, parser: ParserService): Promise<void> { 
        // Check if the graph exists in the MySQL database
        const existingGraph = await this.graphRepository.existsBy({ id: graphId });
        if(!existingGraph) {
            // Throw a NotFoundException if the graph is not found
            throw new NotFoundException('Graph not found');
        }

        // Get a write session for the specified Neo4j graph
        const session = await this.neo4jService.getWriteSession(graphId);

        // Start a transaction for the injection
        const transaction = await session.beginTransaction();

        try {
            // Parse the file into an array of Neo4jEntry objects
            const data: Neo4jEntry[] = await parser.parse(file);

            // Delete existing nodes and relationships related to the specified graphId
            await transaction.run(
                `MATCH (n)-[r]-(m)
                DETACH DELETE n, r, m`
            );

            // Use Promise.all to concurrently execute Neo4j write operations for each entry in the data array
            for (const entry of data) {

                // Use the Neo4j service to execute a write operation
                await transaction.run(
                    // Merge nodes and relationships in the Neo4j graph based on the provided entry
                    `MERGE (e1:${entry.label1} {name: $entity1})
                    MERGE (e2:${entry.label2} {name: $entity2})
                    MERGE (e1)-[r:${entry.relation} {score: $score, PMC_ID: $PMC_ID, sent_id: $sent_id, sentence: $sentence}]-(e2)`,
                    {
                        // Parameters for the Cypher query, values provided by the current entry in the data array
                        entity1: entry.entity1,
                        entity2: entry.entity2,
                        score: entry.score,
                        PMC_ID: entry.PMC_ID,
                        sent_id: entry.sent_id,
                        sentence: entry.sentence
                    }
                );
            }

            // Commit the transaction to apply the changes to the Neo4j graph
            await transaction.commit();

            return;
        } catch (error) {
            // Handle potential errors during the Neo4j write operation
            if (error.code === 'Neo.ClientError.Statement.ParameterMissing' || error.code === 'Neo.ClientError.Statement.SemanticError') {
                // throw a BadRequestException for specific Neo4j errors
                throw new BadRequestException('Missing parameter: ' + error.message);
            } else {
                // rethrow other errors
                throw error;
            }
        } finally {
            // Close the transaction and session, regardless of success or failure
            await transaction.close();
            await session.close();
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

                await Promise.all(ids.map( async id => {
                    // Step 2: Delete the graph nodes and relationships from Neo4j
                    await this.neo4jService.deleteDatabase(id);
                }));
                
            });

            return;
        } catch(error) {
            throw error;
        }
    }
}
