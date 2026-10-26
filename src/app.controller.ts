import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/auth.decorators.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

@Public()
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', db: 'up' };
  }
}
