import { Inject, Injectable } from '@nestjs/common';
import { NEO4J_CONFIG, NEO4J_CONNECTION } from './neo4j.module';
import { Driver, Result, Session } from 'neo4j-driver-core';
import { session } from 'neo4j-driver';
import { Neo4jConfig } from './neo4j-config.interface';
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
     * Get a read session for a specific database.
     *
     * @returns A read session for the specified database.
     */
    getReadSession(): Session {
        return this.driver.session({
            database: this.config.database,
            defaultAccessMode: session.READ,
        });
    }

    /**
     * Get a write session for a specific database.
     *
     * @returns A write session for the specified database.
     */
    getWriteSession(): Session {
        return this.driver.session({
            database: this.config.database,
            defaultAccessMode: session.WRITE,
        });
    }

    /**
     * Execute a read operation in the specified database using a provided Cypher query.
     *
     * @param cypher - The Cypher query to execute.
     * @param params - Optional parameters for the Cypher query.
     * @returns A Promise resolving to the result of the read operation.
     */
    async read(cypher: string, params?: Record<string, any>): Promise<Result> {
        const session = this.getReadSession();

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
    async write(cypher: string, params?: Record<string, any>): Promise<Result> {
        const session = this.getWriteSession();

        try {
            const result = await session.run(cypher, params);
            return result;
        } finally {
            session.close(); // Ensure to close the session after using it
        }
    }
}