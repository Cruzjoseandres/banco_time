import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './common/seeder.service';

async function bootstrap() {
  console.log('Bootstrapping NestJS standalone context for seeding...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(SeederService);
  try {
    await seeder.seed();
    console.log('Standalone seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await app.close();
  }
}
bootstrap();
