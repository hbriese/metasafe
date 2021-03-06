import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string) {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true, { status: 'up' });
    } catch (e) {
      throw new HealthCheckError('Prisma check failed', e);
    }
  }
}
