import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  
  app.useLogger(logger);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Enable CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    credentials: true,
  });
  
  const port = configService.get('PORT') || 3001;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();