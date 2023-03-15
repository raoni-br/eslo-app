import { OnChanges, Input, ChangeDetectorRef, Component, Output, EventEmitter, SimpleChanges } from '@angular/core';

import { Activity } from 'app/@core/models/lesson-material.model';

@Component({
    selector: 'app-lesson-lecture-slides',
    templateUrl: './lesson-lecture-slides.component.html',
    styleUrls: ['./lesson-lecture-slides.component.scss'],
})
export class LessonLectureSlidesComponent implements OnChanges {
    @Input() activities: Activity[];
    @Output() firstStepClick = new EventEmitter<boolean>();
    @Output() lastStepClick = new EventEmitter<boolean>();

    animationDirection: 'forward' | 'back' | 'none';
    lessonStepContent: any;
    currentActivity: Activity;
    currentStep: number;

    /**
     * Constructor
     *
     * @param _changeDetectorRef
     */
    constructor(private _changeDetectorRef: ChangeDetectorRef) {
        // Set the defaults
        this.animationDirection = 'none';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['activities'] && this.activities?.length > 0) {
            this.goToActivity(this.activities[0]);
        }
    }

    private getActivityIndex(activityToSearch: Activity): number {
        return this.activities.findIndex((activity) => activity === activityToSearch);
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onFirstStepClick(clicked: boolean): void {
        if (this.currentActivity === this.activities[0]) {
            this.firstStepClick.emit(clicked);
        } else {
            const previousActivity = this.activities[this.getActivityIndex(this.currentActivity) - 1];
            this.goToActivity(previousActivity);
        }
    }

    onLastStepClick(clicked: boolean): void {
        if (this.currentActivity === this.activities[this.activities.length - 1]) {
            this.lastStepClick.emit(clicked);
        } else {
            const nextActivity = this.activities[this.getActivityIndex(this.currentActivity) + 1];
            this.goToActivity(nextActivity);
        }
    }

    /**
     * Go to activity
     *
     * @param activity
     */
    goToActivity(activity: Activity): void {
        // Decide the animation direction
        this.animationDirection =
            this.getActivityIndex(this.currentActivity) < this.getActivityIndex(activity) ? 'forward' : 'back';

        // Set the current step
        this.currentActivity = activity;
        this.currentStep = 0;

        // Run change detection so the change
        // in the animation direction registered
        this._changeDetectorRef.detectChanges();
    }
}
