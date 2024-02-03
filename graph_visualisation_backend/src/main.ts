import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Create an instance of the Nest application
  const app = await NestFactory.create(AppModule);

  // Use global validation pipes for request payload validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // Start the application and listen on port 4000
  await app.listen(4000);
}
bootstrap();
