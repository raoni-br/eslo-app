import { formViewProvider } from './../../config/form-view.provider';
import { Component, Input } from '@angular/core';
import { ISection, PROPERTY_TYPE } from 'app/@core/models/onboarding.model';
import { OnboardingFormService } from 'app/onboarding/services/onboarding-form.service';

@Component({
    selector: 'app-onboarding-question',
    templateUrl: './onboarding-question.component.html',
    styleUrls: ['./onboarding-question.component.scss'],
    viewProviders: [formViewProvider],
})
export class OnboardingQuestionComponent {
    @Input() question: ISection;

    PROPERTY_TYPE = PROPERTY_TYPE;

    constructor(private onboardingFormService: OnboardingFormService) {}
}
