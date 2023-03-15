import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Enrollment, StudyGroup } from 'app/@core/models/enrollment.model';
import { EventOccurrence } from 'app/@core/models/event-occurrence.model';

import { ENROLLMENT_STATUS } from './../../../@core/models/enrollment.model';

export enum ENROLLMENT_CARD_TYPES {
    ENROLLMENT = 'ENROLLMENT',
    SUBSCRIPTION_RENEWAL = 'SUBSCRIPTION_RENEWAL',
    NEXT_CLASS = 'NEXT_CLASS',
    CURRENT_HOMEWORK = 'CURRENT_HOMEWORK',
}

@Component({
    selector: 'app-enrollment-card',
    templateUrl: './enrollment-card.component.html',
    styleUrls: ['./enrollment-card.component.scss'],
})
export class EnrollmentCardComponent implements OnChanges {
    @Input() enrollment: Enrollment;
    @Input() studyGroup: StudyGroup;
    @Input() nextEvent: EventOccurrence;
    @Output() acceptEnrollmentEvent = new EventEmitter<{ action: string; enrollment: Enrollment }>();

    @Input() type: ENROLLMENT_CARD_TYPES = ENROLLMENT_CARD_TYPES.ENROLLMENT;

    ENROLLMENT_STATUS = ENROLLMENT_STATUS;
    ENROLLMENT_CARD_TYPES = ENROLLMENT_CARD_TYPES;

    color: string;
    strokeColor: string;

    hover = false;

    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['enrollment']) {
            const { currentValue } = changes['enrollment'];

            if (currentValue) {
                if (
                    this.type === ENROLLMENT_CARD_TYPES.CURRENT_HOMEWORK ||
                    this.type === ENROLLMENT_CARD_TYPES.NEXT_CLASS
                ) {
                    this.color = '#FFFFFF';
                    this.strokeColor = '#F5F5F5';
                    return;
                }

                this.color = this.enrollment.level.layoutSettings.primaryColour;
                this.strokeColor = this.enrollment.level.layoutSettings.secondaryColour;
            }
        }
    }

    onAcceptEnrollment(action: string) {
        this.acceptEnrollmentEvent.emit({ action, enrollment: this.enrollment });
    }
}
