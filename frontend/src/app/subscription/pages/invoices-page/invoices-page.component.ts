import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Invoice } from 'app/@core/models/invoice.model';
import { SubscriptionService } from 'app/@core/services/subscription.service';
import { INavigationTabsConfig } from 'app/@shared/components/navigation-tabs/navigation-tabs.component';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-invoices-page',
    templateUrl: './invoices-page.component.html',
    styleUrls: ['./invoices-page.component.scss'],
})
export class InvoicesPageComponent implements OnInit {
    invoices$ = of([{ id: 'd21312' }]);
    invoice$: Observable<Invoice>;

    navigationTabsConfig: INavigationTabsConfig = {
        links: [{ path: '../invoices', label: 'invoice', icon: 'receipt' }],
    };
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private subscriptionService: SubscriptionService,
    ) {}

    ngOnInit() {
        this.invoice$ = this.subscriptionService.getInvoicePreview();
    }

    onInvoiceDetail(invoiceId: string) {
        this.router.navigate([invoiceId], { relativeTo: this.route });
    }
}
