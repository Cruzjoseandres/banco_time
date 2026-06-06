import { Test, TestingModule } from '@nestjs/testing';
import { EspecialidadService } from './especialidad.service';

describe('EspecialidadService', () => {
  let service: EspecialidadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EspecialidadService],
    }).compile();

    service = module.get<EspecialidadService>(EspecialidadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
