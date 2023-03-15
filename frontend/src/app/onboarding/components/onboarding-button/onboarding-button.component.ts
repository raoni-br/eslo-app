import { Component, Input } from '@angular/core';
import {
    BUTTON_ACTION,
    IOnboardingButton,
    IOnboardingCheckbox,
    IOnboardingDialogBox,
    IOnboardingRadio,
} from 'app/@core/models/onboarding.model';
import { OnboardingFormService } from 'app/onboarding/services/onboarding-form.service';

@Component({
    selector: 'app-onboarding-button',
    templateUrl: './onboarding-button.component.html',
    styleUrls: ['./onboarding-button.component.scss'],
})
export class OnboardingButtonComponent {
    @Input() button: IOnboardingButton;
    @Input() property: IOnboardingDialogBox | IOnboardingRadio | IOnboardingCheckbox;
    @Input() vm: any;

    BUTTON_ACTION = BUTTON_ACTION;

    constructor(private onboardingFormService: OnboardingFormService) {}

    onButtonAction(action: string) {
        this.onboardingFormService.emitButtonAction(action);
    }
}
