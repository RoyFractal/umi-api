import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { FileLogger } from './logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new FileLogger() });
  const config = new DocumentBuilder()
    .setTitle('UMI')
    .setDescription('UMI API')
    .setVersion('1.0')
    .addTag('wallet')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(3000);
}
bootstrap();
