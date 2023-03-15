import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnrolledPageComponent } from './pages/enrolled-page/enrolled-page.component';
import { SharedModule } from 'app/@shared/shared.module';
import { RouterModule } from '@angular/router';
import { StudentEnrollmentListComponent } from './components/student-enrollment-list/student-enrollment-list.component';
import { ActiveEnrollmentsPageComponent } from './pages/active-enrollments-page/active-enrollments-page.component';
import { ArchiveEnrollmentsPageComponent } from './pages/archive-enrollments-page/archive-enrollments-page.component';
import { MatCardModule } from '@angular/material/card';
import { StudentEnrollmentPageComponent } from './pages/student-enrollment-page/student-enrollment-page.component';
import { StudentBookPageComponent } from './pages/student-book-page/student-book-page.component';
import { StudentEmptyEnrollmentsComponent } from './components/student-empty-enrollments/student-empty-enrollments.component';

const routes = [
    {
        path: 'enrollment/:enrollmentId',
        component: StudentEnrollmentPageComponent,
    },
    {
        path: 'student-book/:lessonId',
        component: StudentBookPageComponent,
    },
    {
        path: '',
        component: EnrolledPageComponent,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'active' },
            {
                path: 'active',
                component: ActiveEnrollmentsPageComponent,
            },
            {
                path: 'archive',
                component: ArchiveEnrollmentsPageComponent,
            },
        ],
    },
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), MatCardModule, SharedModule],
    declarations: [
        EnrolledPageComponent,
        StudentEnrollmentListComponent,
        ActiveEnrollmentsPageComponent,
        ArchiveEnrollmentsPageComponent,
        StudentEnrollmentPageComponent,
        StudentBookPageComponent,
        StudentEmptyEnrollmentsComponent,
    ],
})
export class EnrolledModule {}
