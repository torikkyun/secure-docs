import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle(configService.get('SWAGGER_TITLE') ?? 'Nest Boilerplate API')
    .setDescription('Made with ❤️ by @torikkyun')
    .setVersion('1.0')
    .addBearerAuth({
      name: 'Authorization',
      bearerFormat: 'Bearer',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header',
    })
    .build();

  SwaggerModule.setup(
    configService.get('SWAGGER_PATH') ?? 'swagger',
    app,
    SwaggerModule.createDocument(app, config),
  );

  await app.listen(configService.get('PORT') ?? 3000);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
