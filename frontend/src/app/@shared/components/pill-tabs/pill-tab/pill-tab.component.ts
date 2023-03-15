import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-pill-tab',
    templateUrl: './pill-tab.component.html',
    styleUrls: ['./pill-tab.component.scss'],
})
export class PillTabComponent {
    @Input() title: string;
    @Input() active = false;
    @Input() icon = '';
    @Input() completed = false;
}
