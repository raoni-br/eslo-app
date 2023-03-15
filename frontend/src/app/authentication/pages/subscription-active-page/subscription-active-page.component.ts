import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SubscriptionService } from 'app/@core/services/subscription.service';
import { UserService } from 'app/@core/services/user.service';
import { interval } from 'rxjs';
import { Subject } from 'rxjs';
import { Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

const COUNTDOWN_SECONDS = 5;
@Component({
    selector: 'app-subscription-active-page',
    templateUrl: './subscription-active-page.component.html',
    styleUrls: ['./subscription-active-page.component.scss'],
})
export class SubscriptionActivePageComponent implements OnInit, OnDestroy {
    imageOptions = {
        src: '../../../../assets/images/backgrounds/auth-success.png',
        width: 699,
        height: 532,
        alt: 'auth happy user',
    };

    timer$: Subscription;
    seconds = COUNTDOWN_SECONDS;

    isLoadingSubscription = false;

    isSubscriptionActive = false;

    private destroy$ = new Subject<void>();

    constructor(
        private router: Router,
        private subscriptionService: SubscriptionService,
        private route: ActivatedRoute,
        private userService: UserService,
    ) {}

    ngOnInit() {
        this.checkCurrentSubscription();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    checkCurrentSubscription() {
        const sessionId = this.route.snapshot.queryParams.session_id;

        if (!sessionId) {
            return;
        }

        this.isLoadingSubscription = true;

        this.subscriptionService.getUserSubscriptions().subscribe({
            next: (subscriptions) => {
                this.subscriptionService
                    .getSubscriptionById(subscriptions[0].id)
                    .valueChanges.pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (res) => {
                            const {
                                data: { subscription },
                            } = res;
                            if (subscription) {
                                const { status } = subscription;

                                if (status === 'ACTIVE') {
                                    this.isSubscriptionActive = true;
                                    this.userService.setUserFromAuthToken().pipe(take(1)).subscribe();
                                    this.initTimer();
                                }
                            }
                        },
                    });
            },
        });
    }

    initTimer() {
        this.timer$ = interval(1000)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (tick) => {
                    this.seconds = COUNTDOWN_SECONDS - (tick + 1);

                    if (tick === COUNTDOWN_SECONDS - 1) {
                        this.redirectToApp();
                    }
                },
            });
    }

    redirectToApp() {
        this.router.navigate(['/']);
    }
}
