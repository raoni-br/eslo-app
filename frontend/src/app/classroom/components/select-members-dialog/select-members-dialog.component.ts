import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Enrollment } from 'app/@core/models/enrollment.model';

@Component({
    selector: 'app-select-members-dialog',
    templateUrl: './select-members-dialog.component.html',
    styleUrls: ['./select-members-dialog.component.scss'],
})
export class SelectMembersDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) private data: { enrollments: Enrollment[] },
        private dialogRef: MatDialogRef<SelectMembersDialogComponent>,
    ) {}

    get enrollments(): Enrollment[] {
        return this.data?.enrollments;
    }

    get selectedEnrollments(): Enrollment[] {
        return this.enrollments.filter((enrollment) => enrollment.selected);
    }

    onAddStudents() {
        this.dialogRef.close(this.selectedEnrollments);
    }
}
