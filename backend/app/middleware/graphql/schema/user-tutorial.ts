import { extendType, inputObjectType, objectType, stringArg, unionType } from 'nexus';
import { UserTutorial } from '../../../models/user-tutorial.model';
import { EsloContext } from '../context';

export const Option = objectType({
    name: 'Option',
    definition(t) {
        t.nonNull.string('type');
        t.string('text');
        t.string('hint');
        t.string('value');
    },
});

export const Button = objectType({
    name: 'Button',
    definition(t) {
        t.nonNull.string('type');
        t.string('text');
        t.string('action');
    },
});

export const Delay = objectType({
    name: 'Delay',
    definition(t) {
        t.nonNull.string('type');
        t.int('time');
        t.int('index');
    },
});

export const Input = objectType({
    name: 'Input',
    definition(t) {
        t.nonNull.string('type');
        t.string('placeholder');
        t.string('valueType');
    },
});

export const CheckboxObjects = unionType({
    name: 'CheckboxObjects',
    resolveType(parent) {
        switch (parent.type) {
            case 'option':
                return 'Option';
            case 'button':
                return 'Button';
            default:
                // invalid type
                return null;
        }
    },
    definition(t) {
        t.members('Option', 'Button');
    },
});

export const Checkbox = objectType({
    name: 'Checkbox',
    definition(t) {
        t.nonNull.string('type');
        t.string('text');
        t.string('key');
        t.boolean('required');
        t.list.field('objects', {
            type: CheckboxObjects,
        });
    },
});

export const RadioObjects = unionType({
    name: 'RadioObjects',
    resolveType(parent) {
        switch (parent.type) {
            case 'option':
                return 'Option';
            case 'button':
                return 'Button';
            default:
                // invalid type
                return null;
        }
    },
    definition(t) {
        t.members('Option', 'Button');
    },
});

export const Radio = objectType({
    name: 'Radio',
    definition(t) {
        t.nonNull.string('type');
        t.string('text');
        t.string('key');
        t.boolean('required');
        t.list.field('objects', {
            type: RadioObjects,
        });
    },
});

export const DialogObjects = unionType({
    name: 'DialogObjects',
    resolveType(parent) {
        switch (parent.type) {
            case 'button':
                return 'Button';
            case 'delay':
                return 'Delay';
            case 'input':
                return 'Input';
            default:
                // invalid type
                return null;
        }
    },
    definition(t) {
        t.members('Button', 'Delay', 'Input');
    },
});

export const DialogBox = objectType({
    name: 'DialogBox',
    definition(t) {
        t.nonNull.string('type');
        t.string('text');
        t.string('key');
        t.boolean('required');
        t.list.field('objects', {
            type: DialogObjects,
        });
    },
});

export const QuestionSteps = unionType({
    name: 'QuestionSteps',
    resolveType(parent) {
        switch (parent.type) {
            case 'radio':
                return 'Radio';
            case 'dialogBox':
                return 'DialogBox';
            case 'checkbox':
                return 'Checkbox';
            default:
                // Invalid type
                return null;
        }
    },
    definition(t) {
        t.members('Radio', 'DialogBox', 'Checkbox');
    },
});

export const DialogSteps = unionType({
    name: 'DialogSteps',
    resolveType(parent) {
        switch (parent.type) {
            case 'dialogBox':
                return 'DialogBox';
            default:
                // invalid type
                return null;
        }
    },
    definition(t) {
        t.members('DialogBox');
    },
});

export const Question = objectType({
    name: 'Question',
    definition(t) {
        t.nonNull.string('type');
        t.string('title');
        t.string('key');
        t.string('order');
        t.string('animation');
        t.list.field('steps', {
            type: QuestionSteps,
        });
    },
});

export const Dialog = objectType({
    name: 'Dialog',
    definition(t) {
        t.nonNull.string('type');
        t.string('title');
        t.string('key');
        t.string('order');
        t.string('animation');
        t.list.field('steps', {
            type: DialogSteps,
        });
    },
});

export const Section = unionType({
    name: 'Section',
    resolveType(parent) {
        switch (parent.type) {
            case 'dialog':
                return 'Dialog';
            case 'question':
                return 'Question';
            default:
                // invalid type
                return null;
        }
    },
    definition(t) {
        t.members('Dialog', 'Question');
    },
});

export const UserTutorialForm = objectType({
    name: 'UserTutorialForm',
    definition(t) {
        t.nonNull.id('id'); // random (for now)
        t.string('title');
        t.string('slug');
        t.string('description');
        t.list.field('sections', {
            type: Section,
        });
    },
});

export const Answer = inputObjectType({
    name: 'Answer',
    definition(t) {
        t.string('key');
        t.string('value');
        t.list.string('values');
    },
});

export const SubmitUserTutorialFormInput = inputObjectType({
    name: 'SubmitUserTutorialFormInput',
    definition(t) {
        t.string('slug');
        t.list.field('answers', {
            type: Answer,
        });
    },
});

export const getUserTutorialFormQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('getUserTutorialForm', {
            type: UserTutorialForm,
            args: { slug: stringArg({ description: 'Form slug' }) },
            resolve: (_root, args) => UserTutorial.findBySlug(args.slug),
        });
    },
});

export const submitUserTutorialFormMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('submitUserTutorialForm', {
            type: UserTutorialForm,
            args: { submitUserTutorialFormInput: SubmitUserTutorialFormInput },
            resolve: (_root, args, context: EsloContext) =>
                context.models.userTutorial.submitForm(args.submitUserTutorialFormInput),
        });
    },
});
