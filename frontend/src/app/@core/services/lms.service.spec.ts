import { TestBed } from '@angular/core/testing';

import { LMSService } from 'app/@core/services/lms.service';

describe('LMSService', () => {
    let service: LMSService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LMSService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
