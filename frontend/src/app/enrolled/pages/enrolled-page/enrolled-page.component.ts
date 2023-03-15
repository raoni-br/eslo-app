import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Enrollment, ENROLLMENT_STATUS } from 'app/@core/models/enrollment.model';
import { ClassroomService } from 'app/@core/services/classroom.service';
import { INavigationTabsConfig } from 'app/@shared/components/navigation-tabs/navigation-tabs.component';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, startWith, take } from 'rxjs/operators';

@Component({
    selector: 'app-enrolled-page',
    templateUrl: './enrolled-page.component.html',
    styleUrls: ['./enrolled-page.component.scss'],
})
export class EnrolledPageComponent implements OnInit {
    navigationTabsConfig: INavigationTabsConfig = {
        links: [
            { path: 'active', icon: 'local_library' },
            { path: 'archive', icon: 'archive' },
        ],
    };

    allStudentEnrollments$: Observable<Enrollment[]>;
    routeStatus$: Observable<string>;
    studentEnrollmentsByStatus$: Observable<Enrollment[]>;

    constructor(private classroomService: ClassroomService, private router: Router, private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.routeStatus$ = this.router.events.pipe(
            filter((evt) => evt instanceof NavigationEnd),
            map(({ url }: NavigationEnd) => url.split('/').pop()),
        );

        this.allStudentEnrollments$ = this.classroomService
            .getClassroom$()
            .pipe(map((classroom) => classroom.studentEnrollments));

        this.studentEnrollmentsByStatus$ = combineLatest([
            this.routeStatus$.pipe(startWith(this.router.url.split('/').pop())),
            this.allStudentEnrollments$,
        ]).pipe(
            map(([routeStatus, allEnrollments]) => {
                const statuses =
                    routeStatus === 'active'
                        ? [ENROLLMENT_STATUS.ACTIVE, ENROLLMENT_STATUS.CONFIRMED]
                        : [ENROLLMENT_STATUS.CANCELLED, ENROLLMENT_STATUS.DELETED];

                const filteredEnrollments = allEnrollments.filter((enrollment) => {
                    return statuses.includes(enrollment.status);
                });

                return filteredEnrollments;
            }),
        );
    }

    goToEnrollment(enrollmentId: string): void {
        this.router.navigate(['enrollment', enrollmentId], { relativeTo: this.route });
    }

    onAcceptEnrollment({ action, enrollment }: { action: string; enrollment: Enrollment }): void {
        if (action === 'decline') {
            this.classroomService.cancelEnrollment(enrollment.id).pipe(take(1)).subscribe();
            return;
        }

        this.classroomService.activateEnrollment(enrollment.id).pipe(take(1)).subscribe();
    }
}
