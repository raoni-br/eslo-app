import { Component, Input } from '@angular/core';
import { Product, ProductPrice } from 'app/@core/models/product.model';

@Component({
    selector: 'app-plan-card',
    templateUrl: './plan-card.component.html',
    styleUrls: ['./plan-card.component.scss'],
})
export class PlanCardComponent {
    @Input() plan: Product;

    @Input() selectedPlanPayTime: string;

    selectedPrice: ProductPrice;

    constructor() {}

    getPlanPrice(prices: ProductPrice[]): ProductPrice {
        this.selectedPrice = prices.find((price) => price.pricePeriod.interval === this.selectedPlanPayTime);
        return this.selectedPrice || prices[0];
    }
}
