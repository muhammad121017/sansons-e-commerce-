import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import { Redis } from 'ioredis';

@Injectable()
export class HealthService extends HealthIndicator {
  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {
    super();
  }

  async isDatabaseHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (error) {
      const isHealthy = false;
      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(key, isHealthy, { message: (error as Error).message }),
      );
    }
  }

  async isRedisHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.redis.ping();
      return this.getStatus(key, true);
    } catch (error) {
      const isHealthy = false;
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, isHealthy, { message: (error as Error).message }),
      );
    }
  }
}
