import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
setCompodocJson(docJson);

import { componentWrapperDecorator } from '@storybook/angular';

export const decorators = [componentWrapperDecorator((story) => `<div class="light-theme">${story}</div>`)];

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {},
    docs: { inlineStories: true },
};
