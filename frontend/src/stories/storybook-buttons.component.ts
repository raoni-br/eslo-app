import { Component, Input } from '@angular/core';

@Component({
    selector: 'storybook-buttons',
    template: `
        <div fxLayout="column" fxLayoutAlign="start center" fxLayoutGap="20px">
            <button mat-button [color]="color">{{ label }}</button>
            <button mat-raised-button [color]="color">{{ label }}</button>
            <button mat-stroked-button [color]="color">{{ label }}</button>
            <button mat-flat-button [color]="color">{{ label }}</button>
            <button mat-button [color]="color">
                <mat-icon>{{ icon }}</mat-icon>
                {{ label }}
            </button>
            <button mat-raised-button [color]="color">
                <mat-icon>{{ icon }}</mat-icon>
                {{ label }}
            </button>
            <button mat-stroked-button [color]="color">
                <mat-icon>{{ icon }}</mat-icon>
                {{ label }}
            </button>
            <button mat-flat-button [color]="color">
                <mat-icon>{{ icon }}</mat-icon>
                {{ label }}
            </button>
            <button mat-icon-button [color]="color">
                <mat-icon>{{ icon }}</mat-icon>
            </button>
            <button mat-fab [color]="color">
                <mat-icon>{{ icon }}</mat-icon>
            </button>
            <button mat-mini-fab [color]="color">
                <mat-icon>{{ icon }}</mat-icon>
            </button>
        </div>
    `,
})
export class StorybookButtonsComponent {
    @Input() label = 'Button';
    @Input() color: 'primary' | 'accent' | 'warn' | '' = '';
    @Input() icon = 'home';
}
