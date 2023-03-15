import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonRecordList } from 'app/@core/models/class-record.model';
import { Enrollment } from 'app/@core/models/enrollment.model';
import { ClassroomService } from 'app/@core/services/classroom.service';
import { INavigationTabsConfig } from 'app/@shared/components/navigation-tabs/navigation-tabs.component';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-student-enrollment-page',
    templateUrl: './student-enrollment-page.component.html',
    styleUrls: ['./student-enrollment-page.component.scss'],
})
export class StudentEnrollmentPageComponent implements OnInit {
    enrollment$: Observable<Enrollment>;

    navigationTabsConfig: INavigationTabsConfig = {
        links: [{ path: '', icon: 'event_note', label: 'schedule', layoutOnly: true }],
    };

    constructor(private route: ActivatedRoute, private classroomService: ClassroomService, private router: Router) {}
    ngOnInit(): void {
        this.getEnrollment();
    }

    getEnrollment() {
        this.enrollment$ = this.classroomService.getEnrollment(this.route.snapshot.params.enrollmentId).pipe(
            map((enrollment) => {
                const mappedEnrollment: Enrollment = {
                    ...enrollment,
                    revertLessonStatus: enrollment.classRecords
                        .filter((record) => record.lesson.id === enrollment.lastLesson.id)
                        .every((record) => record.revertClassStatus),
                    lessonTrackerList: enrollment.lessons.map((lesson: any) => {
                        return {
                            ...lesson,
                            classRecords: enrollment.classRecords.filter((record) => {
                                return record.lesson.id === lesson.id;
                            }),
                        };
                    }),
                };

                return mappedEnrollment;
            }),
        );
    }

    onOpenStudentBook(lesson: LessonRecordList) {
        this.router.navigate(['../../student-book', lesson.id], { relativeTo: this.route });
    }
}
