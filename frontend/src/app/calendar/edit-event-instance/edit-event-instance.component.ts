import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CalendarEvent } from 'angular-calendar';

@Component({
    selector: 'app-edit-event-instance',
    templateUrl: './edit-event-instance.component.html',
    styleUrls: ['./edit-event-instance.component.scss'],
})
export class EditEventInstanceComponent {
    event: CalendarEvent;
    eventForm: FormGroup;
    startDate: string;
    endDate: string;

    constructor(
        public matDialogRef: MatDialogRef<EditEventInstanceComponent>,
        private datePipe: DatePipe,
        @Inject(MAT_DIALOG_DATA) private _data: any,
    ) {
        this.event = this._data.event;
        this.initEventValues();
        this.eventForm = this.createEventForm();
    }

    private initEventValues(): void {
        // Format date and time
        this.startDate = this.datePipe.transform(this.event.start, 'yyyy-MM-ddTHH:mm:ss');
        this.endDate = this.datePipe.transform(this.event.end, 'yyyy-MM-ddTHH:mm:ss');
    }

    private createEventForm(): FormGroup {
        return new FormGroup(
            {
                startDate: new FormControl(this.startDate),
                endDate: new FormControl(this.endDate),
            },
            [ValidateEventTimes],
        );
    }
}

/**
 * Event validation
 *
 * @param eventFormGroup
 * @returns
 */
const ValidateEventTimes: ValidatorFn = (eventFormGroup: FormGroup): ValidationErrors | null => {
    let validEventTime = true;
    if (!eventFormGroup?.controls) {
        validEventTime = false;
    } else {
        const startDateControl = eventFormGroup.get('startDate');
        const startDateValue = new Date(startDateControl.value);

        const endDateControl = eventFormGroup.get('endDate');
        const endDateValue = new Date(endDateControl.value);

        if (endDateValue <= startDateValue) {
            validEventTime = false;
        }
    }

    if (validEventTime) {
        return null;
    } else {
        return { invalidEventTime: true };
    }
};
