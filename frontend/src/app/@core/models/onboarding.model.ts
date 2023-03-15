export interface IForm {
    id?: string;
    title?: string;
    slug?: string;
    description?: string;
    sections?: ISection[];
}

export enum SECTION_TYPE {
    DIALOG = 'dialog',
    QUESTION = 'question',
}

export interface ISection {
    type: SECTION_TYPE;
    title?: string;
    key?: string;
    order?: number;
    animation?: string;
    steps: (IOnboardingDialogBox | IOnboardingRadio | IOnboardingInput | IOnboardingCheckbox)[];
}

export enum PROPERTY_TYPE {
    DIALOG_BOX = 'dialogBox',
    RADIO = 'radio',
    OPTION = 'option',
    BUTTON = 'button',
    INPUT = 'input',
    CHECKBOX = 'checkbox',
    DELAY = 'delay',
    INPUT_FIELD = 'inputField',
}

export enum BUTTON_ACTION {
    NEXT = 'next',
    BACK = 'back',
    SUBMIT = 'submit',
}

export interface IBaseInput {
    type: PROPERTY_TYPE;
    key: string;
    required?: boolean;
    text?: string;
}

export interface IOnboardingDelay {
    type: PROPERTY_TYPE.DELAY;
    time?: number;
    index?: number;
}

export interface IOnboardingOption {
    type: PROPERTY_TYPE.OPTION;
    text?: number;
    value?: number;
}

export interface IOnboardingInputField {
    type: PROPERTY_TYPE.INPUT_FIELD;
    placeholder?: string;
}

export interface IOnboardingRadio extends IBaseInput {
    objects?: (IOnboardingOption | any)[];
}
export interface IOnboardingInput extends IBaseInput {
    type: PROPERTY_TYPE.INPUT;
    placeholder?: string;
    valueType?: string;
}
export interface IOnboardingCheckbox extends IBaseInput {
    type: PROPERTY_TYPE.CHECKBOX;
    objects?: (IOnboardingOption | IOnboardingButton)[];
}

export interface IOnboardingDialogBox extends IBaseInput {
    objects?: (IOnboardingDelay | IOnboardingInput | IOnboardingButton)[];
}
export interface IOnboardingButton {
    type: PROPERTY_TYPE.BUTTON;
    action?: string;
    text?: string;
    isSubmit?: boolean;
}
