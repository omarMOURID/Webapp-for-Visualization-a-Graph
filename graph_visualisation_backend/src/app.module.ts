import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Neo4jModule } from './neo4j/neo4j.module';
import { Neo4jScheme } from './neo4j/neo4j-config.interface';
import { LoggerModule } from './logger/logger.module';
import { LoggerMiddleware } from './middlewars/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        DB_TYPE: joi.string().required(),
        DB_HOST: joi.string().required(),
        DB_PORT: joi.number().required(),
        DB_ROOT_USER: joi.string().required(),
        DB_ROOT_PASSWORD: joi.string().required(),
        DB_DATABASE_NAME: joi.string().required(),
        DB_SYNCHRONIZE: joi.boolean().default(true),
        
        NEO4J_SCHEME: joi.string().required(),
        NEO4J_HOST: joi.string().required(),
        NEO4J_PORT: joi.number().default(''),
        NEO4J_USERNAME: joi.string().required(),
        NEO4J_PASSWORD: joi.string().required(),
        NEO4J_DATABASE: joi.string().required(),
      })
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<any> => ({
        type: configService.getOrThrow<string>('DB_TYPE'),
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_ROOT_USER'),
        password: configService.getOrThrow<string>('DB_ROOT_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE_NAME'), 
        autoLoadEntities: true,
        synchronize: configService.getOrThrow<boolean>('DB_SYNCHRONIZE'),
      }),
      inject: [ConfigService],
    }),
    Neo4jModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        scheme: configService.getOrThrow<Neo4jScheme>('NEO4J_SCHEME'),
        host: configService.getOrThrow<Neo4jScheme>('NEO4J_HOST'),
        port: configService.getOrThrow<string>('NEO4J_PORT'),
        username: configService.getOrThrow<string>('NEO4J_USERNAME'),
        password: configService.getOrThrow<string>('NEO4J_PASSWORD'),
        database: configService.getOrThrow<string>('NEO4J_DATABASE')
      }),
      inject: [ConfigService]
    }),
    LoggerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*'); // Apply the middleware to all routes
      
  }
}
