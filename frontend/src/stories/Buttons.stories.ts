import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { StorybookButtonsComponent } from './storybook-buttons.component';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';

export default {
    title: 'Buttons',
    component: StorybookButtonsComponent,
    argTypes: {
        color: {
            options: ['primary', 'accent', 'warn', ''],
            control: { type: 'radio' },
            default: 'primary',
        },
    },
    decorators: [
        moduleMetadata({
            declarations: [],
            imports: [CommonModule, MatButtonModule, MatIconModule, FlexLayoutModule],
        }),
    ],
} as Meta;

const Template: Story<StorybookButtonsComponent> = (args: StorybookButtonsComponent) => ({
    props: args,
});

export const All = Template.bind({});
All.args = {
    color: '',
};
