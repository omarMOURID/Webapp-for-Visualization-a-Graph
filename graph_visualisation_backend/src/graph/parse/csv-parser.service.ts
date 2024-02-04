import { ParserService } from "./parser.service";
import { Neo4jEntry, isNeo4jEntry } from "../graph.types";
import { Readable } from "stream";
import { parse } from "csv-parse";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";

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
    parse(file: Express.Multer.File): Promise<Neo4jEntry[]> {
        // Convert the file buffer to a string
        const dataArray: Neo4jEntry[] = []; 
        const stream = Readable.from(file.buffer);


        return new Promise((resolve, reject) => {
            try {
                const pipe = stream.pipe(parse({
                    columns: true,
                    cast: true
                }));
    
                pipe.on("data", (data) => {
                    if (!isNeo4jEntry(data)) {
                        const errorMessage = `Invalid element at csv file: ${JSON.stringify(data)}`;
                        stream.destroy(new Error(errorMessage));
                    } else {
                        dataArray.push(data);
                    }
                });
    
                stream.on("end", () => {
                    resolve(dataArray);
                });
    
                stream.on("error", (error) => {
                    reject(new BadRequestException(error.message));
                });
            } catch(error) {
                reject(new InternalServerErrorException(error.message));
            }
        });

    }
}