import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { healthCheck } from './database';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async healthCheck() {
    const dbHealthy = await healthCheck();
    return {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: dbHealthy ? 'connected' : 'disconnected',
    };
  }
}
