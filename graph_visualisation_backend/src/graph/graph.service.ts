import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { CreateGraphDto } from './dto/create-graph.dto';
import { Graph } from './graph.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { ParserService } from './parse/parser.service';
import { Neo4jEntry, lable, relation } from './graph.types';

@Injectable()
export class GraphService {
    constructor(
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

    async findById(id: string, nodeLabels?: lable[], relationLabels?: relation[]): Promise<Graph & {nodes: any[], relations: any[]}> {
        try {
            const graph = await this.graphRepository.findOneByOrFail({id});

            const labelsQuery = nodeLabels ? ':'+nodeLabels.map((label) => `${label}`).join('|') : "";
            const relationsQuery = relationLabels ? ':'+relationLabels.map((label) => `${label}`).join('|'): ""; 

            const result = await this.neo4jService.read(
                `MATCH (n ${labelsQuery} {graphId: $graphId})-[r ${relationsQuery} {graphId: $graphId}]-(m ${labelsQuery} {graphId: $graphId})
                WITH COLLECT(DISTINCT n) as nodes, COLLECT(DISTINCT r) as relations
                RETURN nodes, relations`,
                {
                    graphId: id,
                }
            );

            const nodes = result.records[0].get('nodes');
            const relations = result.records[0].get('relations');
            
            return {
                ...graph,
                description: graph.description,
                nodes,
                relations
            };
        } catch (error) {
            // Handle potential errors during the Neo4j write operation
            if (error.code === 'Neo.ClientError.Statement.ParameterMissing' || error.code === 'Neo.ClientError.Statement.SemanticError') {
                // Log and throw a BadRequestException for specific Neo4j errors
                console.error('Missing parameter error:', error);
                throw new BadRequestException('Missing parameter: ' + error.message); 
            } if ( error instanceof EntityNotFoundError) {
                throw new NotFoundException('Graph not found');
            } else {
                // Log and rethrow other errors
                console.error('Other error:', error);
                throw error;
            }
        }
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
            const data: Neo4jEntry[] = parser.parse(file);
            // Use Promise.all to concurrently execute Neo4j write operations for each entry in the data array
            console.log(data);
            await Promise.all(data.map(async (entry) => {
                // Use the Neo4j service to execute a write operation
                await this.neo4jService.write(
                    // Merge nodes and relationship in Neo4j graph based on the provided entry
                    `
                    MERGE (e1:${entry.label1} {name: $entity1, graphId: $graphId})
                    MERGE (e2:${entry.label2} {name: $entity2, graphId: $graphId})
                    MERGE (e1)-[r:${entry.relation} {score: $score, PMC_ID: $PMC_ID, sent_id: $sent_id, sentence: $sentence, graphId: $graphId}]-(e2)
                    `,
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
            }));
    
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
     * Deletes nodes and relationships from the Neo4j graph based on the specified graph identifier.
     * @param graphId - The identifier for the graph from which the data should be deleted.
     * @returns A Promise that resolves when the deletion is complete.
     */
    async deleteGraph(graphId: string): Promise<void> {
        // Use the Neo4j service to execute a write operation for deleting nodes and relationships
        await this.neo4jService.write(
            `MATCH (n {graphId: $graphId})
            DETACH DELETE n
            `,
            {
                // Parameters for the Cypher query, specifying the graphId to identify nodes for deletion
                graphId: graphId
            }
        );
        
        // Return a Promise that resolves when the deletion is complete
        return;
    }

}
