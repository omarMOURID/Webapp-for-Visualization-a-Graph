import * as Papa from "papaparse";
import { ParserService } from "./parser.service";
import { Neo4jEntry } from "../graph.types";

/**
 * CSVParserService class that implements the ParserService interface.
 * It is responsible for parsing CSV files.
 */
export class CSVParserService implements ParserService {

    private static instance: ParserService;

    private constructor() {}

    static getInstance(): ParserService {
        if (!this.instance) {
            this.instance = new CSVParserService();
        }
        return this.instance;
    }

    /**
     * Parses the content of a CSV file.
     * 
     * @param file - The CSV file to be parsed (Express.Multer.File).
     * @returns An object representing the parsed CSV data.
     */
    parse(file: Express.Multer.File): Neo4jEntry[] {
        // Convert the file buffer to a string
        const content = file.buffer.toString();

        // Use Papa.parse to parse the CSV content with specified options
        const { data } = Papa.parse(content, {
            header: true, // Treat the first row as headers
            skipEmptyLines: true, // Skip empty lines during parsing
            dynamicTyping: true, // Automatically convert numeric and boolean data types
        });

        // Return the parsed result
        return data;
    }
}