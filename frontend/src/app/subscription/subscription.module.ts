import { MatCardModule } from '@angular/material/card';
import { FreeTrialGuard } from 'app/@core/auth/guards/free-trial.guard';
import { InvoicesListComponent } from './components/invoices-list/invoices-list.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { SubscriptionPageComponent } from './pages/subscription-page/subscription-page.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'app/@shared/shared.module';
import { InvoicesPageComponent } from './pages/invoices-page/invoices-page.component';
import { InvoiceDetailsPageComponent } from './pages/invoice-details-page/invoice-details-page.component';
import { InvoicePreviewComponent } from './components/invoice-preview/invoice-preview.component';
import { InvoiceDaysPipe } from './components/invoice-preview/invoice-days.pipe';
import { InvoiceDatePipe } from './components/invoice-preview/invoice-date.pipe';
import { PaymentPageComponent } from './pages/payment-page/payment-page.component';
import { FreeTrialEndedPageComponent } from './pages/free-trial-ended-page/free-trial-ended-page.component';

const routes: Routes = [
    // {
    //     path: '',
    //     component: SubscriptionPageComponent,
    // },
    // { path: '', pathMatch: 'full', redirectTo: 'invoices' },
    {
        path: '',
        component: PaymentPageComponent,
        // canActivate: [FreeTrialGuard],
    },
    {
        path: 'free-trial-ended',
        component: FreeTrialEndedPageComponent,
    },
    {
        path: 'invoices',
        component: InvoicesPageComponent,
        canActivate: [FreeTrialGuard],
    },
    {
        path: 'invoices/:month',
        component: InvoiceDetailsPageComponent,
        canActivate: [FreeTrialGuard],
    },
    {
        path: 'method',
        component: SubscriptionPageComponent,
        canActivate: [FreeTrialGuard],
    },
];
@NgModule({
    declarations: [
        SubscriptionPageComponent,
        InvoicesPageComponent,
        InvoiceDetailsPageComponent,
        InvoicesListComponent,
        InvoicePreviewComponent,
        PaymentPageComponent,
        InvoiceDaysPipe,
        InvoiceDatePipe,
        FreeTrialEndedPageComponent,
    ],
    imports: [CommonModule, RouterModule.forChild(routes), ScrollingModule, MatCardModule, SharedModule],
})
export class SubscriptionModule {}
