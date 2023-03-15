import { Component, Input } from '@angular/core';
import { IOnboardingInput, PROPERTY_TYPE } from 'app/@core/models/onboarding.model';
import { formViewProvider } from 'app/onboarding/config/form-view.provider';
import { OnboardingFormService } from 'app/onboarding/services/onboarding-form.service';

@Component({
    selector: 'app-onboarding-input',
    templateUrl: './onboarding-input.component.html',
    styleUrls: ['./onboarding-input.component.scss'],
    viewProviders: [formViewProvider],
})
export class OnboardingInputComponent {
    @Input() input: IOnboardingInput;
    @Input() key: string;

    PROPERTY_TYPE = PROPERTY_TYPE;

    vm$ = this.onboardingFormService.vm$;

    constructor(private onboardingFormService: OnboardingFormService) {}
}
