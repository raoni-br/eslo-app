import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { SubscriptionService } from 'app/@core/services/subscription.service';
import { UserService } from 'app/@core/services/user.service';

import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FreeTrialGuard implements CanActivate {
    constructor(
        private router: Router,
        private subscriptionService: SubscriptionService,
        private userService: UserService,
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | UrlTree {
        return this.userService.loggedUser.pipe(
            take(1),
            switchMap((user) => {
                const observableToReturn = user?.roles?.includes('teacher')
                    ? this.subscriptionService.getUserSubscriptions().pipe(
                          take(1),
                          map((subscriptions) => {
                              const expiringInDays = +subscriptions[0]?.freeTrial?.expiringInDays;

                              if (expiringInDays <= 0) {
                                  this.router.navigate(['/payment/free-trial-ended']);
                                  return false;
                              }

                              return true;
                          }),
                      )
                    : of(true);

                return observableToReturn;
            }),
        );
    }
}
