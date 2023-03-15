import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CalendarEvent } from 'angular-calendar';

@Component({
    selector: 'app-edit-event-dialog',
    templateUrl: './edit-event-dialog.component.html',
    styleUrls: ['./edit-event-dialog.component.scss'],
})
export class EditEventDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) private data: { event: CalendarEvent; events: any[] },
        private dialogRef: MatDialogRef<EditEventDialogComponent>,
    ) {}

    onClose(refresh?: boolean): void {
        this.dialogRef.close(refresh);
    }

    get event() {
        return this.data?.event;
    }

    get events() {
        return this.data?.events;
    }
}
