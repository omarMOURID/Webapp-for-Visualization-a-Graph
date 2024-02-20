import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, url, params, query, body } = req;

    const isAuthUrl = (url+params[0]).includes('/auth');
    const isUserUrl = (url+params[0]).includes('/user');

    res.on("finish", () => {
        const { statusCode, statusMessage } = res;
        const contentlength = res.get('content-length');

        if (statusCode >= 500) {
            // Log the incoming request with controller name
            this.loggerService.error(
                'Incoming Request',
                statusMessage,
                "HTTP",
                {
                    ip,
                    method,
                    statusCode,
                    contentlength,
                    url: url + params[0],
                    query,
                    body: isAuthUrl || isUserUrl ? "[REDACTED]" : body, 
                },
            );
        } else {
            // Log the incoming request with controller name
            this.loggerService.log(
                'Incoming Request',
                "HTTP",
                {
                    ip,
                    method,
                    statusCode,
                    contentlength,
                    url: url+params[0],
                    query,
                    body: isAuthUrl || isUserUrl ? "[REDACTED]" : body, 
                },
            );
        }
        
    });

    next();
  }
}
