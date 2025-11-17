import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

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

  const swagger = configService.get("swagger");
  const config = new DocumentBuilder()
    .setTitle(swagger.title)
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
    swagger.path,
    app,
    SwaggerModule.createDocument(app, config)
  );

  await app.listen(configService.get("PORT") ?? PORT);
}

bootstrap().catch(() => {
  process.exit(1);
});
