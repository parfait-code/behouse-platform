import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>("CORS_ORIGIN", "http://localhost:3000"),
    credentials: true,
  });

  // Valide et transforme automatiquement les DTOs entrants (class-validator).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix("api");

  const port = configService.get<number>("PORT", 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Behouse API démarrée sur le port ${port}`);
}

void bootstrap();
