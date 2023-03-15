import { formViewProvider } from 'app/onboarding/config/form-view.provider';
import { CdkStepper } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { CustomStepperComponent } from 'app/@shared/components/custom-stepper/custom-stepper.component';

@Component({
    selector: 'app-onboarding-stepper',
    templateUrl: './onboarding-stepper.component.html',
    styleUrls: ['./onboarding-stepper.component.scss'],
    providers: [{ provide: CdkStepper, useExisting: OnboardingStepperComponent }],
    viewProviders: [formViewProvider],
})
export class OnboardingStepperComponent extends CdkStepper {}
