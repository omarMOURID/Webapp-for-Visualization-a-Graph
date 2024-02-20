import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Create an instance of the Nest application
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(LoggerService));

  // Use global validation pipes for request payload validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Webapp for Visualization a Knowledge Graph')
    .setDescription('The project aims to create a web application that visualizes a knowledge graph constructed from articles using Natural Language Processing.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the application and listen on port 4000
  await app.listen(4000);
}
bootstrap();
