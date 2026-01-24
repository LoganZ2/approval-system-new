import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger, // 1. 引入 Logger
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  // 2. 初始化 Logger
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorMsg =
      typeof message === 'object' && (message as any).message
        ? (message as any).message
        : message;

    // 3. 添加日志打印逻辑
    // 通常只对 500 错误打印详细堆栈，或者在此处自定义日志级别
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Path: ${request.url}, Error: ${exception instanceof Error ? exception.stack : exception}`,
      );
    } else {
      // 对于 4xx 错误，可以选择打印个警告或者不打印，以免日志泛滥
      this.logger.warn(
        `Path: ${request.url}, Status: ${status}, Error: ${errorMsg}`,
      );
    }

    response.status(status).json({
      code: status,
      message: errorMsg,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
