import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-group-attendees',
    templateUrl: './group-attendees.component.html',
    styleUrls: ['./group-attendees.component.scss'],
})
export class GroupAttendeesComponent {
    @Input() studyGroupClassAttendees: any[];

    constructor(@Inject(MAT_DIALOG_DATA) private data: { attendees: any[] }) {}

    get attendees() {
        return this.data.attendees;
    }
}
