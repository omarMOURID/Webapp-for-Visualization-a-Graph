import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggerService {
    private readonly logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            transports: [
                new winston.transports.DailyRotateFile({
                    filename: 'application-%DATE%.log',
                    dirname: 'logs',
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '14d',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json(),
                    ),
                })
            ]
        })
    }

    log(message: string, context?: string, details?: Record<string, any>) {
        this.logger.info(message, {details, context });
    }
    
    error(message: string, trace: string, context?: string, details?: Record<string, any>) {
        this.logger.error(message, {details, trace, context });
    }
    
    warn(message: string, context?: string, details?: Record<string, any>) {
        this.logger.warn(message, {details, context });
    }
    
    debug(message: string, context?: string, details?: Record<string, any>) {
        this.logger.debug(message, {details, context });
    }
}
