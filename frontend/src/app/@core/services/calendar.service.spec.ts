import { TestBed } from '@angular/core/testing';

import { CalendarService } from 'app/@core/services/calendar.service';

describe('CalendarService', () => {
    let service: CalendarService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CalendarService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
