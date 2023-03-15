import { Directionality } from '@angular/cdk/bidi';
import { CdkStepper } from '@angular/cdk/stepper';
import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Inject,
    Input,
    Output,
} from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';

@Component({
    selector: 'app-slides-stepper',
    templateUrl: './slides-stepper.component.html',
    styleUrls: ['./slides-stepper.component.scss'],
    providers: [{ provide: CdkStepper, useExisting: SlidesStepperComponent }],
})
export class SlidesStepperComponent extends CdkStepper {
    public hover = false;

    @Input() isFirstSlide: boolean;
    @Input() isLastSlide: boolean;

    @Input() isFirstSection: boolean;
    @Input() isLastSection: boolean;

    @Output() firstStepEvent = new EventEmitter<void>();
    @Output() lastStepEvent = new EventEmitter<void>();

    @HostListener('document:keydown ', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'ArrowLeft') {
            this.previous();
        }
        if (event.key === 'ArrowRight') {
            this.next();
        }
    }

    constructor(
        private mediaObserver: MediaObserver,
        elementRef: ElementRef,
        cdr: ChangeDetectorRef,
        dir: Directionality,
        @Inject(DOCUMENT) document: Document,
    ) {
        super(dir, cdr, elementRef, document);
    }

    selectStepByIndex(index: number): void {
        this.selectedIndex = index;
    }

    onLastStepClicked() {
        this.lastStepEvent.emit();
    }

    onFirstStepClicked() {
        this.firstStepEvent.emit();
    }

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }
}
