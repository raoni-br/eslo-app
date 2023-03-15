import { Component } from '@angular/core';
import { INavigationTabsConfig } from 'app/@shared/components/navigation-tabs/navigation-tabs.component';

@Component({
    selector: 'app-invoice-details-page',
    templateUrl: './invoice-details-page.component.html',
    styleUrls: ['./invoice-details-page.component.scss'],
})
export class InvoiceDetailsPageComponent {
    navigationTabsConfig: INavigationTabsConfig = {
        links: [
            { path: '../invoices', label: 'invoice', icon: 'receipt' },
            { path: '../method', label: 'method', icon: 'payments' },
        ],
    };

    constructor() {}
}
