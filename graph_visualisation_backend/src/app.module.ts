import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphModule } from './graph/graph.module';

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
    GraphModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
