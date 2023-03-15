import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-top-bar-title',
    templateUrl: './top-bar-title.component.html',
    styleUrls: ['./top-bar-title.component.scss'],
})
export class TopBarTitleComponent {
    @Input() text = 'eslo';

    constructor() {}
}
