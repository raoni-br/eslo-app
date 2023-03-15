import { EventEmitter, Input, Output } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { Component, OnChanges } from '@angular/core';
import { Product, ProductPrice } from 'app/@core/models/product.model';

@Component({
    selector: 'app-plans-list',
    templateUrl: './plans-list.component.html',
    styleUrls: ['./plans-list.component.scss'],
})
export class PlansListComponent implements OnChanges {
    termsAndConditions = false;

    @Input() plans: Product[];

    @Input() hasCancelledSubscription: boolean;

    @Output() payEvent = new EventEmitter<any>();

    @Output() startFreeTrial = new EventEmitter<any>();

    selectedPlanPayTime = 'month';

    selectedPrice: ProductPrice;

    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.plans) {
            const { currentValue: plans } = changes.plans;

            if (plans) {
                this.plans = plans.map((plan, index) => ({ ...plan, selected: index === 0 ? true : false }));
            }
        }
    }

    onPlanSelected(index: number): void {
        this.plans = this.plans.map((plan, i) => {
            if (i === index) {
                return { ...plan, selected: true };
            }

            return { ...plan, selected: false };
        });
    }

    onPriceSelected(selectedPrice: ProductPrice): void {
        this.selectedPrice = selectedPrice;
    }

    onPay(): void {
        const selectedPlan = this.plans.find(({ selected }) => selected);
        this.payEvent.emit({ selectedPlan, selectedPrice: this.selectedPrice });
    }

    onStartFreeTrial(selectedPlan: Product): void {
        this.startFreeTrial.emit({ selectedPlan, selectedPlanPayTime: this.selectedPlanPayTime });
    }
}
