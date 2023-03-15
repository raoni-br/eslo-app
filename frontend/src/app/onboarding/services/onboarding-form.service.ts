import { Observable, of, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import {
    IForm,
    IOnboardingCheckbox,
    IOnboardingDelay,
    IOnboardingDialogBox,
    IOnboardingRadio,
    ISection,
    PROPERTY_TYPE,
    SECTION_TYPE,
} from 'app/@core/models/onboarding.model';
import { ISubmitUserTutorialFormAnswer } from 'app/@core/services/onboarding.service';

const ALPHABET = [
    '',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
];
@Injectable()
export class OnboardingFormService {
    private delaySource$ = new Subject<any>();
    delay$ = this.delaySource$.asObservable();

    private buttonActionSource$ = new Subject<string>();
    buttonAction$ = this.buttonActionSource$.asObservable();

    private currentStepSource$ = new Subject<number>();
    currentStep$ = this.currentStepSource$.asObservable();

    private currentAnimationSource$ = new Subject<string>();
    animation$ = this.currentAnimationSource$.asObservable();

    vm$: Observable<any> = of({});

    constructor() {}

    emitDelay(delay: IOnboardingDelay) {
        this.delaySource$.next(delay);
    }

    emitButtonAction(action: string) {
        this.buttonActionSource$.next(`${Date.now()}-${action}`);
    }

    emitCurrentStep(index: number) {
        this.currentStepSource$.next(index);
    }

    emitAnimation(animation: string) {
        this.currentAnimationSource$.next(animation);
    }

    setViewModel(viewModel: any) {
        this.vm$ = of(viewModel);
    }

    convertFormStructureToViewModel(formStructure: IForm) {
        const viewModel = formStructure.sections
            .filter((section) => section.type === SECTION_TYPE.QUESTION)
            .reduce((acc, currSection: ISection) => {
                const viewModelBySection = currSection.steps
                    .filter(
                        (step) =>
                            step.type === PROPERTY_TYPE.DIALOG_BOX ||
                            step.type === PROPERTY_TYPE.CHECKBOX ||
                            step.type === PROPERTY_TYPE.RADIO,
                    )
                    .reduce((acc, curr: IOnboardingDialogBox | IOnboardingRadio | IOnboardingCheckbox) => {
                        const isCheckbox = curr.type === PROPERTY_TYPE.CHECKBOX;

                        if (isCheckbox) {
                            const checkboxKeys = curr.objects
                                .filter((prop) => prop.type === PROPERTY_TYPE.OPTION)
                                .reduce((acc2, curr2, index) => {
                                    return {
                                        ...acc2,
                                        [curr.key]: {
                                            ...acc2[curr.key],
                                            [index + 1]: null,
                                        },
                                    };
                                }, {});

                            return {
                                ...acc,
                                ...checkboxKeys,
                            };
                        }

                        return {
                            ...acc,
                            [curr?.key]: null,
                        };
                    }, {});
                return { ...acc, ...viewModelBySection };
            }, {});

        return viewModel;
    }

    convertFormToAnswers(formValue: any) {
        let checkboxesMap = {};
        const answersWithUniqueKeys = Object.entries(formValue).reduce((acc, [key, value]) => {
            if (key.includes('__')) {
                const [checkboxFormKey, checkboxNumber] = key.split('__');
                if (value) {
                    checkboxesMap = {
                        ...checkboxesMap,
                        [checkboxFormKey]: checkboxesMap[checkboxFormKey]
                            ? [...checkboxesMap[checkboxFormKey], ALPHABET[checkboxNumber]]
                            : [ALPHABET[checkboxNumber]],
                    };
                }
                return { ...acc, [checkboxFormKey]: checkboxesMap[checkboxFormKey] };
            }

            return { ...acc, [key]: value };
        }, {});

        const answers = Object.entries(answersWithUniqueKeys).map(([key, value]) => {
            const valueKey = Array.isArray(value) ? 'values' : 'value';
            return {
                key,
                [valueKey]: value,
            };
        }) as ISubmitUserTutorialFormAnswer[];

        return answers;
    }
}
