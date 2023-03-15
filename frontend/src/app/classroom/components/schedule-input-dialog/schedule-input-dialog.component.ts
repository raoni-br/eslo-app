import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StudyGroup } from 'app/@core/models/enrollment.model';

@Component({
    selector: 'app-schedule-input-dialog',
    templateUrl: './schedule-input-dialog.component.html',
    styleUrls: ['./schedule-input-dialog.component.scss'],
})
export class ScheduleInputDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) private data: { group: StudyGroup }) {}

    get group() {
        return this.data?.group;
    }
}
