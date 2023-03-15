import { Component, Input, Output, ViewEncapsulation, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-lesson-lecture-nav-step',
    templateUrl: './lesson-lecture-nav-step.component.html',
    styleUrls: ['./lesson-lecture-nav-step.component.scss'],
})
export class LessonLectureNavStepComponent {
    @Input() totalSteps: number;
    @Input() currentStep: number;
    @Input() firstDisabled = true;
    @Input() lastDisabled = false;
    @Input() lastStepStyle: 'done' | 'forward' = 'done';
    @Input() offset = false;
    @Output() stepChangeEvent = new EventEmitter<number>();
    @Output() firstStepClick = new EventEmitter<boolean>();
    @Output() lastStepClick = new EventEmitter<boolean>();

    /**
     * Constructor
     */
    constructor() {}

    /**
     * Go to next step
     */
    public gotoNextStep(): void {
        if (this.currentStep === this.totalSteps - 1 && !this.lastDisabled) {
            this.lastStepClick.emit(true);

            return;
        }

        this.stepChangeEvent.emit(++this.currentStep);
    }

    /**
     * Go to previous step
     */
    public gotoPreviousStep(): void {
        if (this.currentStep === 0) {
            if (!this.firstDisabled) {
                this.firstStepClick.emit(true);
            }

            return;
        }

        this.stepChangeEvent.emit(--this.currentStep);
    }
}
