import { DynamicModule, Module, forwardRef } from '@nestjs/common';
import { Neo4jConfig } from './neo4j-config.interface';
import { ConfigService } from '@nestjs/config';
import { Neo4jService } from './neo4j.service';
import neo4j from "neo4j-driver";
import { LoggerService } from 'src/logger/logger.service';
import { LoggerModule } from 'src/logger/logger.module';

// Define constants for configuration and connection
export const NEO4J_CONFIG = "NEO4J_CONFIG";
export const NEO4J_CONNECTION = "NEO4J_CONNECTION";

// Define options for async configuration of Neo4jModule
export interface Neo4jModuleAsyncOptions {
    imports?: any[]; // Modules that should be imported
    useFactory?: (configService: ConfigService) => Promise<Neo4jConfig> | Neo4jConfig; // Factory function to create configuration
    inject?: any[]; // Dependencies to be injected into the factory function
}

// Create a function to create a Neo4j database driver
export const createDatabaseDriver = async (config: Neo4jConfig, logger: LoggerService) => {
    try {
        // Extract configuration parameters
        const {scheme, host, port, username, password} = config;
        
        // Construct the Neo4j connection URL
        const url = port ? `${scheme}://${host}:${port}` : `${scheme}://${host}`;
        
        // Create a Neo4j driver with the provided configuration
        const databaseDriver = neo4j.driver(
            url,
            neo4j.auth.basic(
                username,
                password
            )
        );

        // Check the server info and log connection establishment
        const serverInfo = await databaseDriver.getServerInfo();

        logger.log('Connection established', 'Neo4jModule', serverInfo);

        // If everything is OK, return the driver
        return databaseDriver;
    } catch (error) {
        // Handle authentication error

        logger.error(error.message, error.trace, 'Neo4jModule');
        throw error;
    }
}

// Define the Neo4jModule class
@Module({})
export class Neo4jModule {
    /**
     * Asynchronously configure the Neo4jModule for root.
     * This method allows configuring the Neo4jModule with dynamic, asynchronous options.
     *
     * @param options - The options for configuring the Neo4jModule asynchronously.
     * @returns A dynamic module configuration for the Neo4jModule.
     */
    static forRootAsync(options: Neo4jModuleAsyncOptions): DynamicModule {
        return {
            module: Neo4jModule,
            imports: [
                ...options.imports,
                LoggerModule
            ], // Import specified modules
            providers: [
                {
                    provide: NEO4J_CONFIG,
                    inject: options.inject, // Inject specified dependencies into the factory function
                    useFactory: options.useFactory, // Use the provided factory function for configuration
                },
                {
                    provide: NEO4J_CONNECTION,
                    inject: [NEO4J_CONFIG, LoggerService], // Inject the configuration into the factory function
                    useFactory: async (config: Neo4jConfig, logger: LoggerService) => {
                        return createDatabaseDriver(config, logger); // Create the Neo4j driver using the configuration
                    }
                },
                Neo4jService // Include the Neo4jService as a provider
            ],
            exports: [Neo4jService], // Export the Neo4jService for external use
        }
    }
}