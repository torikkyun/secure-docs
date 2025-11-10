import { HttpExceptionFilter } from "@common/filters/http-exception.filter";
import { TransformInterceptor } from "@common/interceptors/transform.interceptor";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

const PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle(configService.get("SWAGGER_TITLE") ?? "Nest Boilerplate API")
    .setDescription("Made with ❤️ by @torikkyun")
    .setVersion("1.0")
    .addBearerAuth({
      name: "Authorization",
      bearerFormat: "Bearer",
      scheme: "Bearer",
      type: "http",
      in: "Header",
    })
    .build();

  SwaggerModule.setup(
    configService.get("SWAGGER_PATH") ?? "swagger",
    app,
    SwaggerModule.createDocument(app, config)
  );

  await app.listen(configService.get("PORT") ?? PORT);
}

bootstrap().catch(() => {
  process.exit(1);
});
