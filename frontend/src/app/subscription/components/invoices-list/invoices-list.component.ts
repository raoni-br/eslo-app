import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-invoices-list',
    templateUrl: './invoices-list.component.html',
    styleUrls: ['./invoices-list.component.scss'],
})
export class InvoicesListComponent {
    @Input() invoices: any[];

    @Output() invoiceDetailEvent = new EventEmitter<string>();

    constructor() {}

    onInvoiceDetail(invoiceId: string) {
        this.invoiceDetailEvent.emit(invoiceId);
    }
}
