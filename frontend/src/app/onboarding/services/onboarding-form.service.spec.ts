/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OnboardingFormService } from './onboarding-form.service';

describe('Service: OnboardingForm', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [OnboardingFormService],
        });
    });

    it('should ...', inject([OnboardingFormService], (service: OnboardingFormService) => {
        expect(service).toBeTruthy();
    }));
});
