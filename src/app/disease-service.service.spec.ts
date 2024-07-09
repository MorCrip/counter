import { TestBed } from '@angular/core/testing';

import { DiseaseServiceService } from './disease-service.service';

describe('DiseaseServiceService', () => {
  let service: DiseaseServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiseaseServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
