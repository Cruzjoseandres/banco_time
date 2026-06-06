import { Test, TestingModule } from '@nestjs/testing';
import { CitaController } from './cita.controller';
import { CitaService } from './cita.service';

describe('CitaController', () => {
  let controller: CitaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitaController],
      providers: [CitaService],
    }).compile();

    controller = module.get<CitaController>(CitaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
