import { Component, OnInit, ChangeDetectionStrategy, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Event } from 'app/@core/models/event.model';

@Component({
    selector: 'app-weekly-availability-dialog',
    templateUrl: './weekly-availability-dialog.component.html',
    styleUrls: ['./weekly-availability-dialog.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyAvailabilityDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) private data: { eventsToAdd: Event[] }) {}

    get eventsToAdd() {
        return this.data?.eventsToAdd;
    }
}
