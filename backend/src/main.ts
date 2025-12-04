import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    origin: [
      'http://localhost:3000',
      'https://desarrollo-web-hazel.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: [
      'Authorization',
      'Set-Cookie',
      'Cookie',
      'x-refresh-token',
    ],
  });
  const config = new DocumentBuilder()
    .setTitle('Edge Timer API')
    .setDescription(
      'API documentation for Edge Timer Barbershop application. This API provides endpoints for managing appointments, users, services, ratings, and support tickets.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints for user registration and login')
    .addTag('Appointments', 'Manage appointments and barber schedules')
    .addTag('Services', 'Barbershop services management')
    .addTag('Users', 'User management endpoints')
    .addTag('Ratings', 'Appointment ratings and reviews')
    .addTag('Support', 'Support ticket management')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
