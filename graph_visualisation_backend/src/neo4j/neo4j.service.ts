import { Inject, Injectable } from '@nestjs/common';
import { NEO4J_CONFIG, NEO4J_CONNECTION } from './neo4j.module';
import { Driver, Result, Session } from 'neo4j-driver-core';
import { SessionMode, session } from 'neo4j-driver';
import { Neo4jConfig } from './neo4j-config.interface';
import { error } from 'console';

@Injectable()
export class Neo4jService {
    /**
     * Constructor of the Neo4jService.
     *
     * @param driver - Injected Neo4j Driver for database connections.
     */
    constructor(
        @Inject(NEO4J_CONFIG) private readonly config: Neo4jConfig,
        @Inject(NEO4J_CONNECTION) private readonly driver: Driver,
    ) {}

    /**
     * Get a session for a specific database, creating it if it doesn't exist.
     *
     * @param database - The name of the database.
     * @param accessMode - The access mode (READ or WRITE).
     * @returns A session for the specified database.
     */
    private async getSession(database: string, accessMode: SessionMode): Promise<Session> {
        const sessionConfig = {
            database,
            defaultAccessMode: accessMode,
        };

        try {
            // Attempt to get a session, will throw if the database doesn't exist
            const session = this.driver.session(sessionConfig);
            await session.run('RETURN 1');
            return session;
        } catch (error) {
            if (error.code === 'Neo.ClientError.Database.DatabaseNotFound') {
                // Database doesn't exist, create it
                await this.createDatabase(database);
                return this.driver.session(sessionConfig);
            }
            throw error;
        }
    }

    /**
     * Get a read session for a specific database, creating it if it doesn't exist.
     *
     * @param database - The name of the database.
     * @returns A read session for the specified database.
     */
    getReadSession(database: string): Promise<Session> {
        return this.getSession(database, session.READ);
    }

    /**
     * Get a write session for a specific database, creating it if it doesn't exist.
     *
     * @param database - The name of the database.
     * @returns A write session for the specified database.
     */
    getWriteSession(database: string): Promise<Session> {
        return this.getSession(database, session.WRITE);
    }

    /**
     * Execute a read operation in the specified database using a provided Cypher query.
     *
     * @param cypher - The Cypher query to execute.
     * @param params - Optional parameters for the Cypher query.
     * @returns A Promise resolving to the result of the read operation.
     */
    async read(cypher: string, database: string, params?: Record<string, any>): Promise<Result> {
        const session = await this.getReadSession(database);

        try {
            const result = await session.run(cypher, params);
            return result;
        } finally {
            session.close(); // Ensure to close the session after using it
        }
    }

    /**
     * Execute a write operation in the specified database using a provided Cypher query.
     *
     * @param cypher - The Cypher query to execute.
     * @param params - Optional parameters for the Cypher query.
     * @returns A Promise resolving to the result of the write operation.
     */
    async write(cypher: string, database: string, params?: Record<string, any>): Promise<Result> {
        const session = await this.getWriteSession(database);

        try {
            const result = await session.run(cypher, params);
            return result;
        } finally {
            session.close(); // Ensure to close the session after using it
        }
    }

    /**
     * Create a new Neo4j database.
     *
     * @param database - The name of the database to create.
     */
    private async createDatabase(database: string): Promise<void> {
        const session = this.driver.session();
        try {
            // Create the database
            await session.run(`CREATE DATABASE $database`, {
                database
            });
        
        } catch(error) {
            console.log(error);
            throw error;
            
        } finally {
            session.close();
        }
    }

    /**
     * Delete a Neo4j database.
     *
     * @param database - The name of the database to delete.
     */
    async deleteDatabase(database: string): Promise<void> {
        try {
            // Drop the database
            await this.write(`DROP DATABASE ${database} IF EXISTS DESTROY DATA`, database);
        } catch(error) {
            console.log(error)
            throw error;
        }
    }
}