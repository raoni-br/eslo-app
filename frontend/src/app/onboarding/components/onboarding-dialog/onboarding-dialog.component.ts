import { Component, Input, OnInit } from '@angular/core';
import { ISection, PROPERTY_TYPE } from 'app/@core/models/onboarding.model';

@Component({
    selector: 'app-onboarding-dialog',
    templateUrl: './onboarding-dialog.component.html',
    styleUrls: ['./onboarding-dialog.component.scss'],
})
export class OnboardingDialogComponent {
    PROPERTY_TYPE = PROPERTY_TYPE;

    @Input() dialog: ISection;

    constructor() {}
}
