import { UserInputError } from 'apollo-server-express';
import { EsloModel } from './eslo.model';
import { UserWithSubscription } from './user-profile.model';
import tutorialForms from '../tutorial/forms.json';

interface IObjects {
    type: string;
    text: string;
}

interface ISteps extends IObjects {
    key: string;
    required?: boolean;
}

interface ISectionProperties {
    title: string;
    type: string;
    key: string;
    order: number;
    animation?: string;
}

interface IDelay {
    type: string;
    time: number;
    index: number;
}

interface IButton extends IObjects {
    value?: number;
    action?: string;
}

interface IOption extends IObjects {
    value: string;
    hint?: string;
}

interface ICheckbox extends ISteps {
    objects: IOption[];
}

interface IInput {
    type: string;
    placeholder: string;
    valueType: string;
}

interface IRadio extends ISteps {
    objects: IOption[];
}

interface IDialogBox extends ISteps {
    objects: (IDelay | IButton | IInput)[];
}

interface IAnswer {
    key: string;
    value: string;
}

interface IUserTutorialSubmission {
    slug: string;
    answers: IAnswer[];
}

interface ISection extends ISectionProperties {
    steps: (IDialogBox | IRadio | ICheckbox)[];
}
interface IUserTutorialForm {
    id: string;
    title: string;
    slug: string;
    description: string;
    type: string;
    version: number;
    sections: ISection[];
}

export class UserTutorial extends EsloModel {
    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'dashboard');
    }

    public static findBySlug(slug: string): Promise<IUserTutorialForm> {
        const formDetails = tutorialForms.find((item) => item.slug === slug);

        if (!formDetails) {
            throw new UserInputError('Form not found.');
        }

        return JSON.parse(JSON.stringify(formDetails));
    }

    public async submitForm(input: IUserTutorialSubmission): Promise<IUserTutorialForm> {
        // find form
        const tutorialForm = await UserTutorial.findBySlug(input.slug);

        if (!tutorialForm) {
            throw new UserInputError('Form not found.');
        }

        // validations
        tutorialForm.sections.forEach((section: ISection) => {
            section.steps.forEach((step) => {
                if (step.required && step.required === true) {
                    // keys and answers validation
                    if (!input.answers.some((answer) => answer.key === step.key)) {
                        throw new Error('Invalid answers.');
                    }
                }
            });
        });

        // save answers
        await this.prismaClient.userTutorialSubmission.create({
            data: {
                userId: this.loggedUser.id,
                tutorialCode: input.slug,
                version: tutorialForm.version,
                formSubmission: JSON.stringify(input.answers),
            },
        });

        // TODO: return user tutorial submission
        return tutorialForm;
    }

    public async checkOnboardingSubmission(): Promise<Boolean> {
        const submission = await this.prismaClient.userTutorialSubmission.findFirst({
            where: {
                tutorialCode: 'onboarding-form',
                userId: this.loggedUser.id,
            },
        });

        return submission ? true : false;
    }
}
