import { Test, TestingModule } from '@nestjs/testing';
import { EspecialidadController } from './especialidad.controller';
import { EspecialidadService } from './especialidad.service';

describe('EspecialidadController', () => {
  let controller: EspecialidadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EspecialidadController],
      providers: [EspecialidadService],
    }).compile();

    controller = module.get<EspecialidadController>(EspecialidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
