import { Neo4jEntry } from "../graph.types";

export interface ParserService {
    parse(file: Express.Multer.File): Neo4jEntry[];
}