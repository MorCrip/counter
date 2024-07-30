import { TestBed } from '@angular/core/testing';

import { DatepickerCommunicationService } from './datepicker/shared/service/datepicker-communication.service';

describe('DatepickerCommunicationService', () => {
  let service: DatepickerCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatepickerCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
