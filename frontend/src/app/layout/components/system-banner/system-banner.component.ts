import { Component, Input } from '@angular/core';
import { Subscription } from 'app/@core/models/subscription.model';

@Component({
    selector: 'app-system-banner',
    templateUrl: './system-banner.component.html',
    styleUrls: ['./system-banner.component.scss'],
})
export class SystemBannerComponent {
    opened = true;

    @Input() subscriptions: Subscription[] | boolean;
}
