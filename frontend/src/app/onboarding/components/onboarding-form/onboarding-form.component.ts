import { CdkStepper, StepperSelectionEvent } from '@angular/cdk/stepper';
import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { IForm, SECTION_TYPE } from 'app/@core/models/onboarding.model';
import { OnboardingFormService } from 'app/onboarding/services/onboarding-form.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, skip, startWith, takeUntil } from 'rxjs/operators';

import { formViewProvider } from './../../config/form-view.provider';

@Component({
    selector: 'app-onboarding-form',
    templateUrl: './onboarding-form.component.html',
    styleUrls: ['./onboarding-form.component.scss'],
    viewProviders: [formViewProvider],
})
export class OnboardingFormComponent implements AfterViewInit, OnChanges, OnDestroy {
    SECTION_TYPE = SECTION_TYPE;

    _formStructure: IForm;
    get formStructure() {
        return this._formStructure;
    }
    @Input()
    set formStructure(value: IForm) {
        this._formStructure = value;

        if (value) {
            const viewModel = this.onboardingFormService.convertFormStructureToViewModel(value);
            this.onboardingFormService.setViewModel(viewModel);
        }
    }

    _delay: number;
    get delay() {
        return this._delay;
    }
    @Input()
    set delay(value) {
        this._delay = value;
        this.onUpdateDelay();
    }

    @Input()
    _buttonAction: string;
    get buttonAction() {
        return this._buttonAction;
    }
    @Input()
    set buttonAction(value) {
        this._buttonAction = value;
        this.onUpdateButtonAction();
    }

    @Output() cancel = new EventEmitter();
    @Output() save = new EventEmitter();
    @Output() selectedUiChanged = new EventEmitter<string>();
    @Output() submitFormEvent = new EventEmitter<{ slug: string; value: any }>();

    @ViewChild('onboardingForm') onboardingForm: NgForm;
    @ViewChild('onboardingStepper') onboardingStepper: CdkStepper;

    private destroy$ = new Subject<void>();

    constructor(private onboardingFormService: OnboardingFormService) {}

    ngAfterViewInit() {
        // Report when the hero form's "name" changes.
        // Illustrates listening to valueChanges observable.
        this.onboardingForm.valueChanges
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                skip(1), // skip form initialization phase
            )
            .subscribe((change) => {
                // TODO: localStorage
            });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes?.formStructure?.currentValue) {
            this.listenStepper();
        }
    }

    listenStepper() {
        setTimeout(() => {
            this.onboardingStepper.selectionChange
                .pipe(
                    takeUntil(this.destroy$),
                    startWith({
                        selectedIndex: 0,
                        selectedStep: this.onboardingStepper.steps[0],
                    }),
                    distinctUntilChanged((a, b) => a.selectedIndex === b.selectedIndex),
                )
                .subscribe({
                    next: ({ selectedIndex }: StepperSelectionEvent) => {
                        this.onboardingFormService.emitCurrentStep(selectedIndex);

                        const currentSection = this.formStructure.sections[selectedIndex];
                        this.onboardingFormService.emitAnimation(currentSection.animation);
                    },
                });
        }, 0);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSubmit() {
        this.submitFormEvent.emit({ slug: this.formStructure.slug, value: this.onboardingForm.value });
    }

    onUpdateDelay() {
        if (!this.delay) {
            return;
        }
        if ((this.delay as any).index === this.onboardingStepper.selectedIndex) {
            this.onboardingStepper.next();
        }
    }

    onUpdateButtonAction() {
        if (!this.buttonAction) {
            return;
        }

        const action = this.buttonAction.split('-').pop();
        switch (action) {
            case 'next':
                this.onboardingStepper.next();
                break;
            case 'previous':
            case 'back':
                this.onboardingStepper.previous();
                break;
            case 'submit':
                this.onSubmit();
                break;
        }
    }
}
