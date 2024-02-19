import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule, getRepositoryToken } from "@nestjs/typeorm";
import { Graph } from "../../graph/graph.entity";
import { GraphService } from "../../graph/graph.service";
import { QueryFailedError, Repository  } from "typeorm";
import { TypeORMMySqlTestingModule } from "../TypeOrm.module.test";
import { Neo4jTestingModule } from "../Neo4j.module.test";
import { CreateGraphDto } from "src/graph/dto/create-graph.dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { createReadStream, readFile, readFileSync} from "fs";
import { CSVParserService } from "../../graph/parse/csv-parser.service";
import { Neo4jService } from "../../neo4j/neo4j.service";
import { session } from "neo4j-driver";
import { Driver } from "neo4j-driver-core";
import { NEO4J_CONNECTION } from "../../neo4j/neo4j.module";
import { Label, Relation } from "../../graph/graph.types";




const createFakeMulterFileFromPath = (filePath: string, originalname: string): Express.Multer.File => {
    const fileContent = readFileSync(filePath);
  
    return {
      fieldname: 'file',
      originalname: originalname,
      encoding: '7bit',
      mimetype: 'text/csv', // adjust based on your file type
      size: fileContent.length, // adjust based on your file size
      destination: '',
      filename: '',
      path: filePath,
      buffer: fileContent, // read the file content into a buffer
    } as Express.Multer.File;
};


describe("GraphService", () => {
    let service: GraphService;
    let graphRepository: Repository<Graph>;
    let neo4jService: Neo4jService;
    let neo4jDriver: Driver;
    let testingModule: TestingModule;
    let graphData: any[];
    const graphFilePath = __dirname+'/../fixtures/graph.json';
    const csvFilePath = __dirname+'/../fixtures/data_to_inject.csv';
    const csvFilePathWithError = __dirname+'/../fixtures/data_to_inject_with_error.csv';

    // Read the content of the JSON file
    readFile(graphFilePath, 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }
    
        try {
            // Parse the JSON content into a JavaScript object
            graphData = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
        }
    });

    beforeAll(async () => {
        testingModule = await Test.createTestingModule({
            imports: [
                TypeORMMySqlTestingModule([Graph]),
                TypeOrmModule.forFeature([Graph]),
                Neo4jTestingModule(),
            ],
            providers: [
                GraphService,
            ],
        }).compile();

        service = testingModule.get<GraphService>(GraphService);
        graphRepository = testingModule.get<Repository<Graph>>(getRepositoryToken(Graph));
        neo4jService = testingModule.get<Neo4jService>(Neo4jService);
        neo4jDriver = testingModule.get<Driver>(NEO4J_CONNECTION);
    });

    beforeAll(async () => {
        for(let d of graphData) {
            await service.createGraph(d);
        }
    })

    afterAll(async () => {
        const graphs = await graphRepository.find({select: ["id"]});
        const ids = graphs.map(graph => graph.id);
        await service.delete(ids);
    });

    describe("createGraph",() => {
        it("should successfully create a graph entity with valid input data", async () => {
            const createGraphDto = {
                title: "un graph",
                description: "knowledge graph visualisation",
            }
            const result = await service.createGraph(createGraphDto);
    
            expect(result.id).toBeDefined();
            expect(result.isVisible).toBe(true);
            expect(result.title).toBe(createGraphDto.title);
            expect(result.description).toBe(createGraphDto.description);

            await service.delete([result.id]);
        });
        
        it("should create a graph entity even if the description is not provided",async () => {
            const createGraphDto = {
                title: "un graph",
            }

            const result = await service.createGraph(createGraphDto as CreateGraphDto);

            expect(result.id).toBeDefined();
            expect(result.title).toBe(createGraphDto.title);
            expect(result.description).toBe(null);

            await service.delete([result.id]);
        });

        it("should raise a QueryFailedError exception if title is not provided during graph creation",async () => {
            const createGraphDto = {
                description: "knowledge graph visualisation",
            }

            await expect(service.createGraph(createGraphDto as CreateGraphDto))
                .rejects
                .toThrow(QueryFailedError);
        });
    });

    
    describe("findById", () => {
        let graph: Graph;

        beforeEach(async() => {
            graph = (await service.find()).items[5];
            
            const fakeFile = createFakeMulterFileFromPath(csvFilePath, "example");
            await service.injectData(fakeFile, graph.id, CSVParserService.getInstance());
        });

        it("should find and retrieve a graph by its ID along with its nodes and relations", async () => {
            const result = await service.findById(graph.id);

            expect(result.id).toBe(graph.id)
            expect(result.title).toBe(graph.title);
            expect(result.description).toBe(graph.description);
            expect(result.nodes).toBeDefined();
            expect(result.nodes.length).toBeGreaterThan(0);
            expect(result.relations).toBeDefined();
            expect(result.relations.length).toBeGreaterThan(0);
        }, 10000);

        it("should find and retrieve a graph by its ID with specified labels and relations", async () => {
            const result = await service.findById(graph.id, [Label.SPECIES], [Relation.NEGATIVE]);
        
            expect(result.id).toBe(graph.id);
            expect(result.title).toBe(graph.title);
            expect(result.description).toBe(graph.description);
            expect(result.nodes).toBeDefined();
            expect(result.relations).toBeDefined();
        
            // Map and verify that every node has the label Label.SPECIES
            result.nodes.forEach(node => {
                expect(node.labels).toContain(Label.SPECIES);
            });

            result.relations.forEach(relation => {
                expect(relation.type).toBe(Relation.NEGATIVE);
            });

        }, 10000);

        it("should find and retrieve a graph by its ID with a specified pmcId", async () => {
            const pmcid = "PMC10000167";
            const result = await service.findById(graph.id, undefined, undefined, undefined, pmcid);
        
            expect(result.id).toBe(graph.id);
            expect(result.title).toBe(graph.title);
            expect(result.description).toBe(graph.description);
            expect(result.nodes).toBeDefined();
            expect(result.relations).toBeDefined();
            result.relations.forEach(relation => {
                expect(relation.properties.PMC_ID).toBe(pmcid);
            });

        }, 10000);

        it("should find and retrieve a graph by its ID and search for a specified node using name", async () => {
            const nodeName = "cells";
            const result = await service.findById(graph.id, undefined, undefined, nodeName);

            expect(result.id).toBe(graph.id);
            expect(result.title).toBe(graph.title);
            expect(result.description).toBe(graph.description);
            expect(result.nodes).toBeDefined();
            expect(result.relations).toBeDefined();

            // Check if a node with the specified name exists
            const nodeWithName = result.nodes.find(node => node.properties.name === nodeName);
            expect(nodeWithName).toBeDefined();

            // Check if relations have start or end ID matching the ID of the node with the specified name
            const nodeID = nodeWithName ? nodeWithName.elementId : undefined;
            result.relations.forEach(relation => {
                expect(relation.startNodeElementId === nodeID || relation.endNodeElementId === nodeID).toBe(true);
            });

        }, 10000);

        it("should raise a NotFoundException if the graph by ID cannot be found", async () => {
            const fakeId = "test123456";

            await expect(service.findById(fakeId))
                .rejects
                .toThrow(NotFoundException);
        });
    });

    describe("find", () => {
        it("should retrieve a paginated list of graphs with optional visibility filter", async () => {
            // Assuming some graphs are already in the database
            const paginationResult = await service.find(1, 10, undefined,true);

            expect(paginationResult.items).toBeDefined();
            expect(paginationResult.items[0]).toBeInstanceOf(Graph);
            expect(paginationResult.pages).toBe(Math.ceil(graphData.length/10));
            expect(paginationResult.size).toBe(10);
            expect(paginationResult.count).toBe(graphData.length);
        });
    });


    describe("injectData", () => {
        let graph: Graph;
    
        beforeEach(async () => {
            // Assuming some graphs are already in the database
            const graphs = (await service.find()).items;
            // Use the first graph for testing
            graph = graphs.length > 0 ? graphs[0] : null;
        });
    
        it("should successfully inject CSV file data into the Neo4j graph", async () => {
            const fakeFile = createFakeMulterFileFromPath(csvFilePath, "example");
            // Inject data into the Neo4j graph
            await expect(service.injectData(fakeFile, graph.id, CSVParserService.getInstance()))
                .resolves
                .not.toThrow();
    
            const injectedGraph = await service.findById(graph.id);
            expect(injectedGraph.nodes.length).toBeGreaterThan(0);
            expect(injectedGraph.relations.length).toBeGreaterThan(0);
        
        }, 30000);
    
        it("should throw BadRequestException for CSV file with errors during data injection", async () => {
            const fakeFile = createFakeMulterFileFromPath(csvFilePathWithError, "example");
            // Attempt to inject data with a CSV file containing errors
            await expect(service.injectData(fakeFile, graph.id, CSVParserService.getInstance()))
                .rejects
                .toThrow(BadRequestException);

        }, 30000);
    
        it("should throw NotFoundException for a non-existing graph during data injection", async () => {
            const fakeId = "nonExistingGraphId";
            const fakeFile = createFakeMulterFileFromPath(csvFilePathWithError, "example");
            // Attempt to inject data into a non-existing graph
            await expect(service.injectData(fakeFile, fakeId, CSVParserService.getInstance()))
                .rejects
                .toThrow(NotFoundException);
        }, 30000);
    
        afterAll(async () => {
            // Clean up by deleting the graph created for testing
            if (graph) {
                await service.delete([graph.id]);
            }
        }, 30000);
    });

    describe("delete", () => {
        let graph: Graph;
    
        beforeEach(async () => {
            // Assuming some graphs are already in the database
            const graphs = (await service.find()).items;
            // Use the first graph for testing
            graph = graphs.length > 0 ? graphs[0] : null;
        });
    
        it("should delete specified graphs from both MySQL and Neo4j", async () => {
            const graphIdsToDelete = [graph.id];
            // Attempt to delete the specified graph from both MySQL and Neo4j
            await expect(service.delete(graphIdsToDelete))
                .resolves
                .not.toThrow();
    
            // For example, check if the graph is no longer present in the database
            await expect(service.findById(graph.id))
                .rejects
                .toThrow(NotFoundException);

            const testNeo4jDbExist = async () => {
                const readSession = neo4jDriver.session({
                    database: graph.id,
                    defaultAccessMode: session.READ
                });

                await readSession.run('RETURN 1');
                return;
            }

            await expect(testNeo4jDbExist)
                .rejects
                .toThrow(expect.objectContaining({ code: 'Neo.ClientError.Database.DatabaseNotFound' }));

        }, 30000);
    
        it("should throw BadRequestException for an empty array of graph IDs during deletion", async () => {
            const emptyArray: string[] = [];
            // Attempt to delete with an empty array of graph IDs
            await expect(service.delete(emptyArray))
                .rejects
                .toThrow(BadRequestException);
        }, 30000);
    
        it("should throw NotFoundException for a non-existing graph during deletion", async () => {
            const nonExistingGraphId = "nonExistingGraphId";
            const nonExistingGraphIds = [nonExistingGraphId];
            // Attempt to delete a non-existing graph
            await expect(service.delete(nonExistingGraphIds))
                .rejects
                .toThrow(NotFoundException);
        }, 30000);
    });

    describe("updateGraph", () => {
        let graph: Graph;
    
        beforeEach(async () => {
            // Assuming some graphs are already in the database
            const graphs = (await service.find()).items;
            // Use the first graph for testing
            graph = graphs.length > 0 ? graphs[0] : null;
        });

        it("should update the graph with the provided data", async () => {
            // Create a mock updateGraphDto with new values
            const updatedGraphDto = {
                title: "Updated Title",
                description: "Updated Description",
                isVisible: false,
            };
    
            // Call the updateGraph method with the graph ID and updatedGraphDto
            const updatedGraph = await service.updateGraph(graph.id, updatedGraphDto);
    
            // Check if the returned graph has been updated
            expect(updatedGraph.title).toBe(updatedGraphDto.title);
            expect(updatedGraph.description).toBe(updatedGraphDto.description);
            expect(updatedGraph.isVisible).toBe(updatedGraphDto.isVisible);
    
            // Check if the graph entity has been updated in the database
            const retrievedGraph = await service.findById(graph.id);
            expect(retrievedGraph.title).toBe(updatedGraphDto.title);
            expect(retrievedGraph.description).toBe(updatedGraphDto.description);
            expect(retrievedGraph.isVisible).toBe(updatedGraphDto.isVisible);
        });
    
        it("should throw NotFoundException when trying to update a non-existing graph", async () => {
            // Create a non-existing graph ID
            const nonExistingGraphId = "non-existing-id";
    
            // Create a mock updateGraphDto with new values
            const updatedGraphDto = {
                title: "Updated Title",
                description: "Updated Description",
                isVisible: false,
            };
    
            // Call the updateGraph method with the non-existing graph ID and updatedGraphDto
            try {
                await service.updateGraph(nonExistingGraphId, updatedGraphDto);
                // The above line should throw an exception, so the code below shouldn't be executed
                expect(true).toBe(false);
            } catch (error) {
                // Check if the error is a NotFoundException
                expect(error instanceof NotFoundException).toBe(true);
            }
        });
    });
    
    
});