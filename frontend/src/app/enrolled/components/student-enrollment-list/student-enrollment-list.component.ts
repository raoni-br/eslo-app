import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Enrollment, ENROLLMENT_STATUS } from 'app/@core/models/enrollment.model';

@Component({
    selector: 'app-student-enrollment-list',
    templateUrl: './student-enrollment-list.component.html',
    styleUrls: ['./student-enrollment-list.component.scss'],
})
export class StudentEnrollmentListComponent {
    @Input() enrollments: Enrollment[];

    @Output() goToEnrollmentEvent = new EventEmitter();
    @Output() acceptEnrollmentEvent = new EventEmitter<{ action: string; enrollment: Enrollment }>();

    goToEnrollmentStatuses = [ENROLLMENT_STATUS.CONFIRMED, ENROLLMENT_STATUS.CANCELLED, ENROLLMENT_STATUS.DELETED];

    constructor() {}

    goToEnrollment(enrollment: Enrollment) {
        this.goToEnrollmentEvent.emit(enrollment.id);
    }

    onAcceptEnrollment(body: { action: string; enrollment: Enrollment }) {
        this.acceptEnrollmentEvent.emit(body);
    }
}
