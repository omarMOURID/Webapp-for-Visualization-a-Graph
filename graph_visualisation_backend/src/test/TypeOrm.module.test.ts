import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

export const TypeORMMySqlTestingModule = (entities: any[]) =>
    TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService): Promise<any> => ({
            type: configService.getOrThrow<string>('DB_TYPE'),
            host: configService.getOrThrow<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            username: configService.getOrThrow<string>('DB_ROOT_USER'),
            password: configService.getOrThrow<string>('DB_ROOT_PASSWORD'),
            database: "test", 
            entities: [...entities],
            autoLoadEntities: true,
            synchronize: true,
        }),
        inject: [ConfigService],
    });