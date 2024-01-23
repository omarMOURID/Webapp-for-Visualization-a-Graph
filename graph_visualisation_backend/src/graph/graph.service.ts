import { BadRequestException, Injectable } from '@nestjs/common';
import { Neo4jError } from 'neo4j-driver';
import { Neo4jService } from 'src/neo4j/neo4j.service';


type lable = "Species" | "Disease" | "Chemicals";
type relation = "positive" | "negative" | "neutral";

interface Neo4jEntry {
    label1: lable;
    label2: lable;
    relation: relation;
    entity1: string;
    entity2: string;
    score: number; 
    PMC_ID: string;
    sent_id: number; 
    sentence: string;
}



@Injectable()
export class GraphService {
    constructor(
        private readonly neo4jService: Neo4jService
    ) {}

    /**
     * Injects data into Neo4j graph based on the provided entries.
     * @param data - An array of Neo4jEntry objects representing the data to be injected.
     * @param graphId - The identifier for the graph in which the data should be injected.
     * @returns A Promise that resolves when the injection is complete.
     * @throws {BadRequestException} Throws an exception if there is a missing parameter or a semantic error in the Cypher query.
     */
    async injectData(data:Neo4jEntry[], graphId: string): Promise<void> {
        try {
            // Use Promise.all to concurrently execute Neo4j write operations for each entry in the data array
            await Promise.all(data.map(async (entry) => {
                // Use the Neo4j service to execute a write operation
                await this.neo4jService.write(
                    `
                    // Merge nodes and relationship in Neo4j graph based on the provided entry
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
