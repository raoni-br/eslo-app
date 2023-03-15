import { Component } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';

@Component({
    selector: 'app-top-bar',
    templateUrl: 'top-bar.component.html',
    styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent {
    constructor(private mediaObserver: MediaObserver) {}

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }
}
