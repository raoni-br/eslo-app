import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Enrollment } from 'app/@core/models/enrollment.model';

@Component({
    selector: 'app-group-members-list',
    templateUrl: './group-members-list.component.html',
    styleUrls: ['./group-members-list.component.scss'],
})
export class GroupMembersListComponent {
    @Input() enrollments: Enrollment[];

    @Output() enrollmentDetailEvent = new EventEmitter<string>();
    @Output() enrollmentEditEvent = new EventEmitter<string>();

    constructor() {}

    onEnrollmentDetail(enrollmentId: string): void {
        this.enrollmentDetailEvent.emit(enrollmentId);
    }

    onEnrollmentEdit(enrollmentId: string): void {
        this.enrollmentEditEvent.emit(enrollmentId);
    }
}
