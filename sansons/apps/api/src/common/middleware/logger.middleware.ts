import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      
      this.logger.log(
        JSON.stringify({
          requestId,
          method,
          path: originalUrl,
          status: statusCode,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        })
      );
    });

    next();
  }
}
