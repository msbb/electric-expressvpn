import { TestBed } from '@angular/core/testing';

import { ExpresssvpnService } from './expressvpn.service';

describe('ExpresssvpnService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ExpresssvpnService = TestBed.get(ExpresssvpnService);
    expect(service).toBeTruthy();
  });
});
