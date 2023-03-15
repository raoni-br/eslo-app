import { gql } from 'apollo-angular';

export const ONBOARDING_DELAY = gql`
    fragment delayDetails on Delay {
        type
        time
        index
    }
`;

export const ONBOARDING_BUTTON = gql`
    fragment buttonDetails on Button {
        type
        text
        action
    }
`;

export const ONBOARDING_OPTION = gql`
    fragment optionDetails on Option {
        type
        text
        value
        hint
    }
`;

export const ONBOARDING_INPUT = gql`
    fragment inputDetails on Input {
        type
        placeholder
        valueType
    }
`;

export const ONBOARDING_DIALOG_BOX = gql`
    fragment dialogBoxDetails on DialogBox {
        type
        text
        key
        required
        objects {
            ...buttonDetails
            ...delayDetails
            ...inputDetails
        }
    }
    ${ONBOARDING_BUTTON}
    ${ONBOARDING_DELAY}
    ${ONBOARDING_INPUT}
`;

export const ONBOARDING_RADIO = gql`
    fragment radioDetails on Radio {
        type
        text
        key
        required
        objects {
            ...optionDetails
            ...buttonDetails
        }
    }
    ${ONBOARDING_OPTION}
    ${ONBOARDING_BUTTON}
`;

export const ONBOARDING_CHECKBOX = gql`
    fragment checkboxDetails on Checkbox {
        type
        text
        key
        required
        objects {
            ...optionDetails
            ...buttonDetails
        }
    }
    ${ONBOARDING_OPTION}
    ${ONBOARDING_BUTTON}
`;

export const ONBOARDING_DIALOG = gql`
    fragment dialogDetails on Dialog {
        type
        title
        order
        animation
        steps {
            ...dialogBoxDetails
        }
    }
    ${ONBOARDING_DIALOG_BOX}
`;

export const ONBOARDING_QUESTION = gql`
    fragment questionDetails on Question {
        type
        title
        key
        order
        animation
        steps {
            ...radioDetails
            ...checkboxDetails
            ...dialogBoxDetails
        }
    }
    ${ONBOARDING_RADIO}
    ${ONBOARDING_CHECKBOX}
    ${ONBOARDING_DIALOG_BOX}
`;

export const ONBOARDING_FORM = gql`
    fragment formDetails on UserTutorialForm {
        id
        title
        slug
        description
        sections {
            ...dialogDetails
            ...questionDetails
        }
    }
    ${ONBOARDING_DIALOG}
    ${ONBOARDING_QUESTION}
`;
