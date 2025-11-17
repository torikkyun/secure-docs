import { ConfigService, registerAs } from "@nestjs/config";
import { DocumentBuilder } from "@nestjs/swagger";

export function createSwaggerConfig(configService: ConfigService) {
  return new DocumentBuilder()
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
}

export default registerAs("swagger", () => ({
  title: process.env.SWAGGER_TITLE ?? "Nest Boilerplate API",
  path: process.env.SWAGGER_PATH ?? "swagger",
}));
