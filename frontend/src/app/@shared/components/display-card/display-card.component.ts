import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-display-card',
    templateUrl: './display-card.component.html',
    styleUrls: ['./display-card.component.scss'],
})
export class DisplayCardComponent {
    @Input() hasBorder = true;
    @Input() hasBackgroundColor = true;
    @Input() shadowClass = 'mat-elevation-z4';
    @Input() padding = '16px 16px 16px 16px';
    @Input() borderRadius = '14px';
    @Input() fullScreen = true;

    @Input() maxWidth = '800px';
    @Input() title: string;

    constructor() {}
}
