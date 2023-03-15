import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { take } from 'rxjs/operators';

import { loadStripe, Stripe } from '@stripe/stripe-js';

import { environment } from 'environments/environment';
import { ICreateSubscriptionCheckoutInput, SubscriptionService } from 'app/@core/services/subscription.service';
import { Product, IProductFilters, ProductPrice } from 'app/@core/models/product.model';
import { Subscription } from 'app/@core/models/subscription.model';
import { UserService } from 'app/@core/services/user.service';

@Component({
    selector: 'app-select-plan-page',
    templateUrl: './select-plan-page.component.html',
    styleUrls: ['./select-plan-page.component.scss'],
})
export class SelectPlanPageComponent implements OnInit {
    isTeacher: boolean;
    isStudent: boolean;
    hasCancelledSubscription: boolean;

    imageNormalOptions = {
        src: '../../../../assets/images/backgrounds/auth-image.png',
        width: 569,
        height: 532,
        alt: 'auth normal user',
    };

    imageCancelledOptions = {
        src: '../../../../assets/images/backgrounds/auth-cancelled.png',
        width: 570,
        height: 528,
        alt: 'subscription cancelled user',
    };

    plans$: Observable<Product[]>;

    stripe: Stripe;

    constructor(
        private subscriptionService: SubscriptionService,
        private userService: UserService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit() {
        const isTeacher = this.route.snapshot.queryParams.teacher === 'true' ? true : false;
        const isStudent = this.route.snapshot.queryParams.student === 'true' ? true : false;

        this.hasCancelledSubscription = this.router.url.includes('canceled');

        this.getProducts(isTeacher, isStudent);
        this.initStripe();
    }

    async initStripe() {
        this.stripe = await loadStripe(`${environment.stripePublicKey}`);
    }

    getProducts(isTeacher?: boolean, isStudent?: boolean) {
        let productFilters: IProductFilters;

        if (isTeacher) {
            productFilters = {
                categoryCode: 'teacher_licence',
            };
        }

        if (isStudent) {
            productFilters = {
                categoryCode: 'student_licence',
            };
        }

        this.plans$ = this.subscriptionService.getProducts(productFilters);
    }

    onStartFreeTrial({
        selectedPlan,
        selectedPlanPayTime,
    }: {
        selectedPlan: Product;
        selectedPlanPayTime: string;
    }): void {
        const priceId = selectedPlan.prices.find((price) => price.pricePeriod.interval === selectedPlanPayTime).id;

        this.subscriptionService.createFreeTrialSubscription(priceId).subscribe({
            next: async (newSubscription: Subscription) => {
                if (!newSubscription) {
                    console.error('Error creating free trial subscription');
                    return;
                }

                this.userService.setUserFromAuthToken().pipe(take(1)).subscribe();
                this.router.navigate(['/']);
            },
        });
    }

    onPay({ selectedPlan, selectedPrice }: { selectedPlan: Product; selectedPrice: ProductPrice }) {
        const subscriptionCheckoutInput: ICreateSubscriptionCheckoutInput = {
            checkoutItems: [{ priceId: selectedPrice.id, quantity: 1 }],
        };

        this.subscriptionService.createSubscriptionCheckout(subscriptionCheckoutInput).subscribe({
            next: async (res: Subscription) => {
                try {
                    await this.stripe.redirectToCheckout({ sessionId: res.paymentProviderCheckoutId });
                } catch (error: any) {
                    console.error(error);
                }
            },
        });
    }
}
