import { Observable } from 'rxjs';
import { ICustomerPaymentSettings, SubscriptionService } from './../../../@core/services/subscription.service';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Stripe, loadStripe, StripeCardElement, CreateSourceData } from '@stripe/stripe-js';
import { environment } from 'environments/environment';
import { Subscription } from 'app/@core/models/subscription.model';
import { Router } from '@angular/router';
import { IProductFilters, Product } from 'app/@core/models/product.model';
import { switchMap, tap } from 'rxjs/operators';
import { UserService } from 'app/@core/services/user.service';

@Component({
    selector: 'app-payment-page',
    templateUrl: './payment-page.component.html',
    styleUrls: ['./payment-page.component.scss'],
})
export class PaymentPageComponent implements OnInit {
    @ViewChild('cardElement') cardElement: ElementRef;

    stripe: Stripe;
    stripeCard: StripeCardElement;

    selectedPlanPayTime = 'month';

    plans$: Observable<Product[]>;

    subscriptions$ = this.subscriptionService.getUserSubscriptions();

    constructor(
        private subscriptionService: SubscriptionService,
        private router: Router,
        private userService: UserService,
    ) {}

    ngOnInit() {
        this.getProducts();
    }

    // ngAfterViewInit() {
    //     this.initStripeCard();
    // }

    // async initStripeCard() {
    //     this.stripe = await loadStripe(`${environment.stripePublicKey}`);

    //     const elements = this.stripe.elements();
    //     this.stripeCard = elements.create('card', {
    //         hidePostalCode: true,
    //     });
    //     this.stripeCard.mount(this.cardElement.nativeElement);
    // }

    getProducts() {
        const hasTeacherRole = this.userService.hasRole('teacher');
        const hasStudentRole = this.userService.hasRole('student');

        let productFilters: IProductFilters;

        if (hasTeacherRole) {
            productFilters = {
                categoryCode: 'teacher_licence',
            };
        }

        if (hasStudentRole) {
            productFilters = {
                categoryCode: 'student_licence',
            };
        }

        this.plans$ = this.subscriptionService.getProducts(productFilters);
    }

    // async pay() {
    //     const { error, source } = await this.stripe.createSource(this.stripeCard as any, {
    //         metadata: { userId: 'asdasdasdasd' },
    //     });
    //     console.log(`pay -> source`, source);
    // }

    onChoosePlan(firstSubscription: Subscription, plan: Product) {
        const { id } = firstSubscription;

        const priceId = plan.prices.find((price) => price.pricePeriod.interval === this.selectedPlanPayTime).id;

        this.subscriptionService
            .activateAndUpgradeSubscriptionMutation({
                subscriptionId: id,
                subscriptionItems: [{ priceId, quantity: 1 }],
            })
            .subscribe({
                next: async (data) => {
                    if ((data as any).__typename === 'CustomerPaymentSettings') {
                        await this.stripe.redirectToCheckout({
                            sessionId: (data as ICustomerPaymentSettings).paymentProviderCheckoutSessionId,
                        });
                    } else if ((data as any).__typename === 'Subscription') {
                        // TODO: go to polling and see if subscription is active
                    }
                },
            });
    }
}
