import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { IOnboardingButton, IOnboardingRadio, PROPERTY_TYPE } from 'app/@core/models/onboarding.model';
import { formViewProvider } from 'app/onboarding/config/form-view.provider';
import { OnboardingFormService } from 'app/onboarding/services/onboarding-form.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
    selector: 'app-onboarding-radio',
    templateUrl: './onboarding-radio.component.html',
    styleUrls: ['./onboarding-radio.component.scss'],
    viewProviders: [formViewProvider],
})
export class OnboardingRadioComponent implements OnChanges {
    @Input() radio: IOnboardingRadio;
    @Input() key: string;
    @Input() stepIndex: number;
    @Input() sectionOrder: number;

    vm$ = this.onboardingFormService.vm$;

    PROPERTY_TYPE = PROPERTY_TYPE;

    buttons: IOnboardingButton[];

    constructor(private onboardingFormService: OnboardingFormService) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['radio'].currentValue) {
            this.buttons = this.radio.objects.filter((obj) => obj.type === PROPERTY_TYPE.BUTTON) as IOnboardingButton[];
        }
    }
}
