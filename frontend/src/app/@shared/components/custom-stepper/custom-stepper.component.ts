import { CdkStepper } from '@angular/cdk/stepper';
import { Component, HostListener, Input } from '@angular/core';

@Component({
    selector: 'app-custom-stepper',
    templateUrl: './custom-stepper.component.html',
    styleUrls: ['./custom-stepper.component.scss'],
    providers: [{ provide: CdkStepper, useExisting: CustomStepperComponent }],
})
export class CustomStepperComponent extends CdkStepper {
    @Input() hasWarmUp: boolean;
    @Input() hasAudio: boolean;

    @HostListener('document:keydown ', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'ArrowUp') {
            this.previous();
        }
        if (event.key === 'ArrowDown') {
            this.next();
        }
    }

    selectStepByIndex(index: number): void {
        this.selectedIndex = index;
    }
}
