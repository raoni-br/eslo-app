import { CdkStepper, StepperSelectionEvent } from '@angular/cdk/stepper';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { ActivatedRoute } from '@angular/router';
import { Lesson } from 'app/@core/models/lesson.model';
import { LMSService } from 'app/@core/services/lms.service';
import { INavigationTabsConfig } from 'app/@shared/components/navigation-tabs/navigation-tabs.component';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-lesson-class-page',
    templateUrl: './lesson-class-page.component.html',
    styleUrls: ['./lesson-class-page.component.scss'],
})
export class LessonClassPageComponent {
    lesson$ = this.lmsService.getLesson(this.route.snapshot.params.lessonId).pipe(
        tap((lesson) => {
            const activities = lesson.lessonMaterial.activities;
            const firstActivity = activities[0];
            if (firstActivity.activitySlides.length === 1) {
                this.isLastSlide = true;
            }
        }),
    );

    navigationTabsConfig: INavigationTabsConfig = {
        links: [
            { path: '../script', label: 'script', icon: 'description' },
            { path: '../class', label: 'lesson', icon: 'class' },
        ],
    };

    isFullscreen = false;

    @ViewChild('sectionStepper') sectionStepper: CdkStepper;
    @ViewChildren('slideStepper') slideSteppers: QueryList<CdkStepper>;

    isLastSlide = false;
    isFirstSlide = false;

    constructor(
        private lmsService: LMSService,
        private route: ActivatedRoute,
        private mediaObserver: MediaObserver,
        @Inject(DOCUMENT) private document: Document,
    ) {}

    onStepperChange({ selectedIndex }: StepperSelectionEvent, lesson: Lesson, isSection: boolean) {
        let currentSectionIndex: number;
        if (isSection) {
            currentSectionIndex = selectedIndex;
        } else {
            currentSectionIndex = this.sectionStepper.selectedIndex;
        }

        let slideStepperIndex = !isSection && selectedIndex;

        if (isSection) {
            const currentSlideStepper = this.slideSteppers.toArray()[currentSectionIndex];
            currentSlideStepper.reset();
            slideStepperIndex = 0;
        }

        const activities = lesson.lessonMaterial.activities;
        const currentActivity = activities[currentSectionIndex];

        const isLastSlide = currentActivity.activitySlides.length - 1 === selectedIndex && !isSection;

        if ((currentActivity.order > 1 && slideStepperIndex === 0) || currentActivity.activitySlides.length === 1) {
            this.isFirstSlide = true;
            if (currentActivity.order === 1) {
                this.isFirstSlide = false;
            }
        } else {
            this.isFirstSlide = false;
        }

        if (
            (currentActivity.order !== activities.length &&
                isLastSlide &&
                currentActivity.order !== activities.length) ||
            (currentActivity.activitySlides.length === 1 && currentActivity.order !== activities.length)
        ) {
            this.isLastSlide = true;
        } else {
            this.isLastSlide = false;
        }
    }

    onLastStep() {
        this.sectionStepper.next();
    }

    onFirstStep() {
        this.sectionStepper.previous();
    }

    onFullscreen(imgElement: any) {
        const elem = imgElement || this.document.documentElement;

        if (!this.document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
                this.isFullscreen = true;
            }
        } else {
            if (this.document.exitFullscreen) {
                this.document.exitFullscreen();
                this.isFullscreen = false;
            }
        }
    }

    checkFullscreen() {
        if (this.isFullscreen) {
            this.document.exitFullscreen();
            this.isFullscreen = false;
        }
    }

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }
}
