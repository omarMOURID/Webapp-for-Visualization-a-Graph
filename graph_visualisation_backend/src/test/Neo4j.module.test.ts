import { ConfigModule, ConfigService } from '@nestjs/config';
import { Neo4jScheme } from '../neo4j/neo4j-config.interface';
import { Neo4jModule } from '../neo4j/neo4j.module';

export const Neo4jTestingModule = () =>
    Neo4jModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
        scheme: configService.getOrThrow<Neo4jScheme>('NEO4J_TEST_SCHEME'),
        host: configService.getOrThrow<string>('NEO4J_TEST_HOST'),
        username: configService.getOrThrow<string>('NEO4J_TEST_USERNAME'),
        password: configService.getOrThrow<string>('NEO4J_TEST_PASSWORD'),
        }),
        inject: [ConfigService]
    });