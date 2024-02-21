import { NestFactory } from '@nestjs/core'; 
import { AppModule } from './app.module'; 
import { LoggerService } from './logger/logger.service';
import { ValidationPipe } from '@nestjs/common'; 
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; 

async function bootstrap() {
  // Création d'une instance de l'application Nest
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Configuration pour mettre en mémoire tampon les journaux
  });

  // Activation du Cross-Origin Resource Sharing (CORS) pour permettre à l'application d'être accessible depuis un autre domaine
  app.enableCors({
    origin: process.env.FRONT_END_ORIGIN, // L'origine autorisée est définie dans une variable d'environnement
  });

  // Utilisation d'un service de journalisation personnalisé pour les journaux de l'application
  app.useLogger(app.get(LoggerService));

  // Utilisation de tuyaux de validation globaux pour la validation des charges utiles de requête
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Permet de transformer automatiquement les données entrantes en objets correspondants aux DTO
    transformOptions: { enableImplicitConversion: true }, // Activation de la conversion implicite pour les types non stricts
  }));

  // Configuration Swagger pour générer la documentation de l'API
  const config = new DocumentBuilder()
    .addBearerAuth() // Ajout de la configuration pour l'authentification via jeton Bearer
    .setTitle('Webapp for Visualization a Knowledge Graph') // Définition du titre de l'API
    .setDescription('The project aims to create a web application that visualizes a knowledge graph constructed from articles using Natural Language Processing.') // Description de l'API
    .setVersion('1.0') // Définition de la version de l'API
    .build(); // Construction de la configuration Swagger

  const document = SwaggerModule.createDocument(app, config); // Création du document Swagger basé sur la configuration
  SwaggerModule.setup('api', app, document); // Configuration de Swagger pour exposer la documentation de l'API à l'URL '/api'

  // Démarrage de l'application et écoute sur le port 4000
  await app.listen(4000);
}

bootstrap(); // Appel de la fonction de démarrage de l'application
