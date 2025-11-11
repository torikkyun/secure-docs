import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { SupabaseService } from "./supabase.service";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>("DATABASE_URL"),
        entities: [`${__dirname}/../../modules/**/entities/*.entity{.ts,.js}`],
        synchronize: configService.get("NODE_ENV") !== "production",
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
  ],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class DatabaseModule {}
