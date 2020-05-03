import { TestBed } from '@angular/core/testing';

import { CallbackDataServiceService } from './callback-data-service.service';

describe('CallbackDataServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CallbackDataServiceService = TestBed.get(CallbackDataServiceService);
    expect(service).toBeTruthy();
  });
});
