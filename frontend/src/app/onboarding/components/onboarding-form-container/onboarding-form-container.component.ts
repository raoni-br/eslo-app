import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from 'app/@core/services/onboarding.service';
import { OnboardingFormService } from 'app/onboarding/services/onboarding-form.service';

import { formViewProvider } from './../../config/form-view.provider';

@Component({
    selector: 'app-onboarding-form-container',
    templateUrl: './onboarding-form-container.component.html',
    styleUrls: ['./onboarding-form-container.component.scss'],
    viewProviders: [formViewProvider],
})
export class OnboardingFormContainerComponent {
    formStructure$ = this.onboardingService.getUserTutorialFormQuery('onboarding-form');

    delay$ = this.onboardingFormService.delay$;
    buttonAction$ = this.onboardingFormService.buttonAction$;

    vm$ = this.onboardingFormService.vm$;

    constructor(
        private onboardingService: OnboardingService,
        private onboardingFormService: OnboardingFormService,
        private router: Router,
    ) {}

    onSubmitForm({ slug, value }: { slug: string; value: any }) {
        const answers = this.onboardingFormService.convertFormToAnswers(value);

        this.onboardingService.submitUserTutorialForm({ slug, answers }).subscribe({
            next: (res) => {
                this.router.navigate(['/']);
            },
        });
    }
}
