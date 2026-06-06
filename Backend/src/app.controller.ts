import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SeederService } from './common/seeder.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly seederService: SeederService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('seed-db')
  async seedDatabase() {
    await this.seederService.seed();
    return {
      success: true,
      message: 'Database seeded successfully with 200 users and historical data!'
    };
  }
}
