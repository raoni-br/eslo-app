import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { CommonModule } from '@angular/common';

import { NavigationBarComponent } from 'app/layout/components/navigation-bar/navigation-bar.component';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

export default {
    title: 'Layout/NavigationBar',
    component: NavigationBarComponent,
    argTypes: {
        activeLink: {
            options: ['dashboard', 'enrolled', 'lms', 'classroom', 'calendar', 'payment', ''],
            control: { type: 'radio' },
        },
    },
    decorators: [
        moduleMetadata({
            declarations: [NavigationBarComponent],
            imports: [CommonModule, MatRippleModule, MatIconModule],
        }),
    ],
} as Meta;

const Template: Story<NavigationBarComponent> = (args: NavigationBarComponent) => ({
    component: NavigationBarComponent,
    props: args,
});

export const Links = Template.bind({});
Links.args = {
    activeLink: 'dashboard',
    hasAdminRole: false,
    hasTeacherRole: true,
    hasStudentRole: false,
    links: [
        {
            label: 'Panel',
            path: 'dashboard',
            icon: 'dashboard',
            teacher: true,
            student: true,
            admin: true,
            position: 'left',
        },

        {
            label: 'Enrolled',
            path: 'enrolled',
            icon: 'badge',
            student: true,
            admin: true,
            position: 'right',
        },

        {
            label: 'Courses',
            path: 'lms',
            icon: 'school',
            teacher: true,
            admin: true,
            position: 'left',
        },
        {
            label: 'Classes',
            path: 'classroom',
            icon: 'group',
            teacher: true,
            admin: true,
            position: 'right',
        },
        {
            label: 'Calendar',
            path: 'calendar',
            icon: 'calendar_today',
            teacher: true,
            admin: true,
            position: 'right',
        },
        {
            label: 'Payment',
            path: 'payment',
            icon: 'payment',
            teacher: true,
            student: true,
            admin: true,
            position: 'menu',
        },
    ],
};
