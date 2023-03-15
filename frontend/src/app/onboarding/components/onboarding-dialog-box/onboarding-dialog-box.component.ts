import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { IOnboardingButton, IOnboardingDialogBox, PROPERTY_TYPE } from 'app/@core/models/onboarding.model';
import { OnboardingFormService } from 'app/onboarding/services/onboarding-form.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-onboarding-dialog-box',
    templateUrl: './onboarding-dialog-box.component.html',
    styleUrls: ['./onboarding-dialog-box.component.scss'],
})
export class OnboardingDialogBoxComponent implements OnChanges {
    @Input() dialogBox: IOnboardingDialogBox;
    @Input() key: string;
    @Input() stepIndex: number;
    @Input() sectionOrder: number;

    vm$ = this.onboardingFormService.vm$;

    PROPERTY_TYPE = PROPERTY_TYPE;

    buttons: IOnboardingButton[];

    constructor(private onboardingFormService: OnboardingFormService, private mediaObserver: MediaObserver) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dialogBox'].currentValue) {
            this.buttons = this.dialogBox.objects.filter(
                (obj) => obj.type === PROPERTY_TYPE.BUTTON,
            ) as IOnboardingButton[];
        }
    }

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }
}
