import { IOnboardingButton } from './../../../@core/models/onboarding.model';
import { formViewProvider } from './../../config/form-view.provider';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { IOnboardingCheckbox, PROPERTY_TYPE } from 'app/@core/models/onboarding.model';
import { OnboardingFormService } from 'app/onboarding/services/onboarding-form.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-onboarding-checkbox',
    templateUrl: './onboarding-checkbox.component.html',
    styleUrls: ['./onboarding-checkbox.component.scss'],
    viewProviders: [formViewProvider],
})
export class OnboardingCheckboxComponent implements OnChanges {
    @Input() checkbox: IOnboardingCheckbox;
    @Input() key: string;
    @Input() stepIndex: number;
    @Input() sectionOrder: number;

    PROPERTY_TYPE = PROPERTY_TYPE;

    vm$ = this.onboardingFormService.vm$;

    buttons: IOnboardingButton[];

    constructor(private onboardingFormService: OnboardingFormService) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['checkbox'].currentValue) {
            this.buttons = this.checkbox.objects.filter(
                (obj) => obj.type === PROPERTY_TYPE.BUTTON,
            ) as IOnboardingButton[];
        }
    }
}
