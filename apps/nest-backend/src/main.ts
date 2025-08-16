import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true, 
  }))

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Important since you're using withCredentials: true
  });

  // using express.raw to handle raw body for Razorpay webhook
  // This is necessary for Razorpay to verify the signature correctly
  app.use('/payments/razorpay', express.raw({ type: 'application/json' }));

  await app.listen(3001, '0.0.0.0');
}
bootstrap();
