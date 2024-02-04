import { Neo4jError } from "neo4j-driver";
import { Neo4jEntry } from "../graph.types";

export interface ParserService {
    parse(file: Express.Multer.File): Promise<Neo4jEntry[]> | Neo4jEntry[];
}