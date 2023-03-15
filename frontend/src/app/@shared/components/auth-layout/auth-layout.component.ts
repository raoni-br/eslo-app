import { Platform } from '@angular/cdk/platform';
import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';

@Component({
    selector: 'app-auth-layout',
    templateUrl: './auth-layout.component.html',
    styleUrls: ['./auth-layout.component.scss'],
})
export class AuthLayoutComponent {
    @Input() noBorder: boolean;
    @Input() maxWidth: string;

    @Input() imageOptions = {
        src: '../../../../assets/images/backgrounds/auth-image.png',
        width: 569,
        height: 532,
        alt: 'auth normal user',
    };

    constructor(private mediaObserver: MediaObserver, private platform: Platform) {}

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }

    get isLesserThanMedium() {
        return this.mediaObserver.isActive('lt-md');
    }

    get isIOS() {
        return this.platform.IOS;
    }

    get isGreaterThanMedium() {
        return this.mediaObserver.isActive('gt-sm');
    }
}
