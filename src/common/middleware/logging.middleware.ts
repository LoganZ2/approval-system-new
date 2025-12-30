import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // 记录请求开始
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // 记录请求体（如果是POST/PUT请求且不是文件上传）
    if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
      const bodyCopy = { ...req.body };
      // 敏感信息过滤（如密码等）
      if (bodyCopy.password) {
        bodyCopy.password = '***';
      }
      this.logger.debug(`Request Body: ${JSON.stringify(bodyCopy)}`);
    }

    // 监听响应完成
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const duration = Date.now() - startTime;

      const logMessage = `${method} ${originalUrl} ${statusCode} - ${duration}ms - ${contentLength || 0} bytes`;
      
      if (statusCode >= 400) {
        this.logger.error(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}