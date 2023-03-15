import { Component, Output, Input, ChangeDetectorRef, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

import { MediaAssociation } from 'app/@core/models/lesson-material.model';

@Component({
    selector: 'app-lesson-media-content',
    templateUrl: './lesson-media-content.component.html',
    styleUrls: ['./lesson-media-content.component.scss'],
})
export class LessonMidiaContentComponent implements OnChanges {
    @Input() mediaContent: MediaAssociation[];
    @Input() enableFirstStep = false;
    @Input() offsetStepNavigation = false;
    @Input() lastStepStyle: 'done' | 'forward' = 'forward';
    @Output() firstStepClick = new EventEmitter<boolean>();
    @Output() lastStepClick = new EventEmitter<boolean>();

    animationDirection: 'forward' | 'back' | 'none';
    lessonStepContent: any;
    currentStep: number;

    /**
     * Constructor
     *
     * @param _changeDetectorRef
     * @param _fuseSidebarService
     */
    constructor(private _changeDetectorRef: ChangeDetectorRef) {
        // Set the defaults
        this.animationDirection = 'none';
        this.currentStep = 0;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['mediaContent']) {
            this.currentStep = 0;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getAnimationDirection(): string {
        if (this.animationDirection === 'back') {
            return '-100%';
        }
        return '100%';
    }

    onStepChange(newStep: number): void {
        // Set the animation direction
        this.animationDirection = this.currentStep > newStep ? 'back' : 'forward';

        // Run change detection so the change
        // in the animation direction registered
        this._changeDetectorRef.detectChanges();

        this.currentStep = newStep;
    }

    /**
     *
     */
    onFirstStepClick(clicked: boolean): void {
        this.firstStepClick.emit(clicked);
    }
    /**
     *
     */
    onLastStepClick(clicked: boolean): void {
        this.lastStepClick.emit(clicked);
    }
}
