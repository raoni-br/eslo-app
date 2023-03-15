import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Enrollment, ENROLLMENT_STATUS } from 'app/@core/models/enrollment.model';
import { ClassroomService } from 'app/@core/services/classroom.service';
import { DashboardService } from 'app/@core/services/dashboard.service';
import { UserService } from 'app/@core/services/user.service';
import { differenceInDays } from 'date-fns';
import { map, take } from 'rxjs/operators';

import { ENROLLMENT_CARD_TYPES } from './../../../@shared/components/enrollment-card/enrollment-card.component';

export interface ITeacherCardContent {
    name: string;
    time: string;
    startDateTime?: number;
    enrollmentSource?: {
        id: string;
        type: string;
    };
    enrollments?: Enrollment[];
}

@Component({
    selector: 'app-dashboard-page',
    templateUrl: './dashboard-page.component.html',
    styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent {
    ENROLLMENT_CARD_TYPES = ENROLLMENT_CARD_TYPES;

    hasAdminRole = this.userService.hasRole('admin');
    hasTeacherRole = this.userService.hasRole('teacher');
    hasStudentRole = this.userService.hasRole('student');

    pendingEnrollments$ = this.classroomService
        .getClassroom$()
        .pipe(
            map(({ studentEnrollments }) =>
                studentEnrollments.filter((enrollment) => enrollment.status === ENROLLMENT_STATUS.ACTIVE),
            ),
        );

    teacherDashboard$ = this.dashboardService.getTeacherDashboard().pipe(
        map((teacherDashboard) => {
            const nextEvents = teacherDashboard.nextEvents
                .map((scheduleItem) => {
                    const startDateTime = parseInt(scheduleItem.startDateTime, 10);
                    const startDate = new Date(startDateTime);
                    const time = Intl.DateTimeFormat('pt-br', {
                        hour: 'numeric',
                        minute: 'numeric',
                    }).format(startDate);

                    const enrollmentSource = {
                        id: scheduleItem?.enrollment?.id || scheduleItem?.studyGroup?.id,
                        type: scheduleItem?.enrollment?.id ? 'ENROLLMENT' : 'STUDY_GROUP',
                    };

                    return {
                        name: scheduleItem.title,
                        time,
                        startDateTime,
                        enrollmentSource,
                    };
                })
                .sort((a, b) => a.startDateTime - b.startDateTime);

            const subscriptionsRenewals = teacherDashboard.students.reduce((acc, currentStudent) => {
                const subscriptions = currentStudent.subscriptions.map((subscription) => {
                    const today = new Date();
                    const renewalDate = new Date(subscription.renewalDate);
                    const time = `${differenceInDays(renewalDate, today)} days`;
                    return {
                        name: `${currentStudent.firstName} ${currentStudent.familyName}`,
                        time,
                        enrollments: currentStudent.enrollments,
                    };
                });

                return [...acc, ...subscriptions];
            }, []);

            return { nextEvents, subscriptionsRenewals };
        }),
    );

    studentDashboard$ = this.dashboardService.getStudentDashboard().pipe(
        map(({ nextEvent }) => {
            return { nextEvent };
        }),
    );

    constructor(
        private classroomService: ClassroomService,
        private userService: UserService,
        private dashboardService: DashboardService,
        private router: Router,
    ) {}

    onAcceptEnrollment({ action, enrollment }: { action: string; enrollment }) {
        if (action === 'decline') {
            this.classroomService.cancelEnrollment(enrollment.id).pipe(take(1)).subscribe();
            return;
        }

        this.classroomService.activateEnrollment(enrollment.id).pipe(take(1)).subscribe();
    }

    onGoTo(content: ITeacherCardContent) {
        if (content?.enrollments) {
            const { name } = content;

            this.router.navigate(['/classroom/students'], { fragment: name.replace(/ /g, '') });
        }

        if (content?.enrollmentSource) {
            const { id, type } = content?.enrollmentSource;
            const isGroup = type === 'STUDY_GROUP';
            const path = isGroup ? 'groups' : 'enrollments';
            const schedulePath = isGroup ? 'schedule' : '';

            this.router.navigate(['/classroom', path, id, schedulePath]);
            return;
        }
    }
}
