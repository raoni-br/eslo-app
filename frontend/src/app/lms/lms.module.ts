import { LessonCardComponent } from './components/lesson-card/lesson-card.component';
import { CoursesPageComponent } from './pages/courses-page/courses-page.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSliderModule } from '@angular/material/slider';

import { SharedModule } from 'app/@shared/shared.module';
import { LessonListComponent } from './lesson/lesson-list/lesson-list.component';
import { CourseDetailComponent } from './course/course-detail/course-detail.component';
import { LessonDetailComponent } from './lesson/lesson-detail/lesson-detail.component';
import { LessonLectureSlidesComponent } from './lesson/lesson-lecture-slides/lesson-lecture-slides.component';
import { LessonMidiaContentComponent } from './lesson/lesson-media-content/lesson-media-content.component';
import { LessonLectureNavStepComponent } from './lesson/lesson-lecture-nav-step/lesson-lecture-nav-step.component';
import { MatCardModule } from '@angular/material/card';
import { LessonFinishedDialogComponent } from './components/lesson-finished-dialog/lesson-finished-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { CoursesListComponent } from './components/courses-list/courses-list.component';
import { CourseDetailPageComponent } from './pages/course-detail-page/course-detail-page.component';

import { MatListModule } from '@angular/material/list';
import { LessonScriptPageComponent } from './pages/lesson-script-page/lesson-script-page.component';
import { LessonsListComponent } from './components/lessons-list/lessons-list.component';
import { MatChipsModule } from '@angular/material/chips';
import { ProgramLevelRangePipe } from './pipes/program-level-range.pipe';
import { FilterLessonsPipe } from './pipes/filter-lessons.pipe';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LessonClassPageComponent } from './pages/lesson-class-page/lesson-class-page.component';
import { SlidesStepperComponent } from './components/slides-stepper/slides-stepper.component';

const routes = [
    { path: '', pathMatch: 'full', redirectTo: 'courses' },
    {
        path: 'courses',
        component: CoursesPageComponent,
    },
    {
        path: 'courses/:courseId',
        component: CourseDetailPageComponent,
    },
    {
        path: 'programs/:programId',
        component: CourseDetailComponent,
    },
    {
        path: 'lessons/:lessonId',
        component: LessonDetailComponent,
    },
    {
        path: 'lessons/:lessonId/script',
        component: LessonScriptPageComponent,
    },
    {
        path: 'lessons/:lessonId/class',
        component: LessonClassPageComponent,
    },
];

@NgModule({
    declarations: [
        // Components
        LessonListComponent,
        CourseDetailComponent,
        LessonCardComponent,
        LessonDetailComponent,
        LessonLectureSlidesComponent,
        LessonMidiaContentComponent,
        LessonLectureNavStepComponent,
        LessonFinishedDialogComponent,
        LessonScriptPageComponent,
        CoursesPageComponent,
        CoursesListComponent,
        CourseDetailPageComponent,
        LessonsListComponent,
        LessonClassPageComponent,
        SlidesStepperComponent,

        // Pipes
        ProgramLevelRangePipe,
        FilterLessonsPipe,
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),

        // material imports
        MatFormFieldModule,
        MatSelectModule,
        MatTooltipModule,
        MatInputModule,
        MatTabsModule,
        MatToolbarModule,
        MatCardModule,
        MatCheckboxModule,
        MatRippleModule,
        MatListModule,
        MatChipsModule,
        MatProgressBarModule,
        MatSliderModule,

        // app imports
        SharedModule,
    ],
    providers: [{ provide: Window, useValue: window }],
})
export class LMSModule {}
