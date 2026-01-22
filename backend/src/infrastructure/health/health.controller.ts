import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from "@nestjs/terminus";
import { Public } from "src/common/decorators/public.decorator";
import { PrismaService } from "src/database/prisma.service";

@Controller("health")
@ApiTags("health")
@Public()
export class HealthController {
  private readonly health: HealthCheckService;
  private readonly prismaHealth: PrismaHealthIndicator;
  private readonly prisma: PrismaService;

  constructor(
    health: HealthCheckService,
    prismaHealth: PrismaHealthIndicator,
    prisma: PrismaService
  ) {
    this.health = health;
    this.prismaHealth = prismaHealth;
    this.prisma = prisma;
  }

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck("database", this.prisma),
    ]);
  }
}
