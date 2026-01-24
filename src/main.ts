// Load environment variables before any other imports
import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { closePool } from './database';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // 启用优雅关闭
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);

  // 优雅关闭处理
  process.on('SIGTERM', () => {
    logger.log('SIGTERM signal received: closing HTTP server');
    void (async () => {
      await app.close();
      await closePool();
      process.exit(0);
    })();
  });

  process.on('SIGINT', () => {
    logger.log('SIGINT signal received: closing HTTP server');
    void (async () => {
      await app.close();
      await closePool();
      process.exit(0);
    })();
  });
}

void bootstrap();
