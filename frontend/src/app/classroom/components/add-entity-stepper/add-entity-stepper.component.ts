import { CdkStepper } from '@angular/cdk/stepper';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-add-entity-stepper',
    templateUrl: './add-entity-stepper.component.html',
    styleUrls: ['./add-entity-stepper.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: CdkStepper, useExisting: AddEntityStepperComponent }],
})
export class AddEntityStepperComponent extends CdkStepper {
    @Input() entity: string;
    @Input() isMobile: boolean;
    @Input() isEditing: boolean;

    @Output() submitFormEvent = new EventEmitter();

    selectStepByIndex(index: number): void {
        this.selectedIndex = index;
    }

    onSubmit(): void {
        this.submitFormEvent.emit();
    }

    nextStep() {
        let isNextStepEditable: boolean;

        let currentPos = this.selectedIndex;
        while (!isNextStepEditable) {
            isNextStepEditable = this.steps.get(currentPos + 1).editable;
            currentPos++;
        }

        this.selectedIndex = currentPos;
    }

    previousStep() {
        let isPreviousStepEditable: boolean;

        let currentPos = this.selectedIndex;
        while (!isPreviousStepEditable) {
            isPreviousStepEditable = this.steps.get(currentPos - 1).editable;
            currentPos--;
        }

        this.selectedIndex = currentPos;
    }
}
