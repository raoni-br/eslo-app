import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent {
    @Input() text: string;
    @Input() color: 'primary' | 'accent' = 'primary';
    @Input() fontSize = '15px';

    constructor() {}

    get isPrimary(): boolean {
        return this.color === 'primary';
    }

    get isAccent(): boolean {
        return this.color === 'accent';
    }
}
