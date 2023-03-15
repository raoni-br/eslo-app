import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Event } from 'app/@core/models/event.model';

@Component({
    selector: 'app-invitation-events',
    templateUrl: './invitation-events.component.html',
    styleUrls: ['./invitation-events.component.scss'],
})
export class InvitationEventsComponent {
    @Input() sourceTypeControl: FormControl;
    @Input() events: FormArray;
    @Input() eventsForm: FormGroup;
    @Input() type: string;

    @Output() addEventSource = new EventEmitter();
    @Output() updateEventSource = new EventEmitter();
    @Output() removeEventSource = new EventEmitter();

    constructor() {}

    addEvent() {
        this.addEventSource.emit();
    }

    updateEvent(event: Event, controlIndex: number) {
        this.updateEventSource.emit({ event, controlIndex });
    }

    removeEvent(index: number) {
        this.removeEventSource.emit(index);
    }

    getEventHasErrorMessage(eventControl: AbstractControl) {
        if (eventControl.getError('hasConflict')) {
            return 'Event has schedule conflict';
        }

        if (eventControl.getError('hasNoDaySelected')) {
            return 'Event has no day selected';
        }

        if (eventControl.getError('hasStartAndEndTimeConflict')) {
            return 'Event has conflict with start and end time';
        }

        return '';
    }
}
