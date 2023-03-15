import { Component } from '@angular/core';
import { INavigationTabsConfig } from 'app/@shared/components/navigation-tabs/navigation-tabs.component';

@Component({
    selector: 'app-subscription-page',
    templateUrl: './subscription-page.component.html',
    styleUrls: ['./subscription-page.component.scss'],
})
export class SubscriptionPageComponent {
    navigationTabsConfig: INavigationTabsConfig = {
        links: [
            { path: '../invoices', label: 'invoice', icon: 'receipt' },
            { path: '../method', label: 'method', icon: 'payments' },
        ],
    };

    constructor() {}
}
