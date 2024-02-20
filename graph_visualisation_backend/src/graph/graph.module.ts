import { Module } from '@nestjs/common';
import { GraphService } from './graph.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Neo4jScheme } from 'src/neo4j/neo4j-config.interface';
import { Neo4jModule } from 'src/neo4j/neo4j.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Graph } from './graph.entity';
import { GraphController } from './graph.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        Neo4jModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
            scheme: configService.getOrThrow<Neo4jScheme>('NEO4J_SCHEME'),
            host: configService.getOrThrow<string>('NEO4J_HOST'),
            port: configService.getOrThrow<string>('NEO4J_PORT'),
            username: configService.getOrThrow<string>('NEO4J_USERNAME'),
            password: configService.getOrThrow<string>('NEO4J_PASSWORD'),
            database: configService.getOrThrow<string>('NEO4J_DATABASE')
            }),
            inject: [ConfigService]
        }),
        TypeOrmModule.forFeature([Graph]),
        AuthModule,
    ],
    providers: [GraphService],
    exports: [GraphService],
    controllers: [GraphController],
})
export class GraphModule {}
