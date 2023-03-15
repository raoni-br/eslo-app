import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';

import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { UserService } from '../../services/user.service';

@Injectable({ providedIn: 'root' })
export class SubscriptionGuard implements CanActivate {
    constructor(private router: Router, private userService: UserService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | UrlTree {
        return this.userService.loggedUser.pipe(
            take(1),
            map((loggedUser) => {
                if (!loggedUser) {
                    this.router.navigate(['/auth/login']);
                    return false;
                }

                if (loggedUser && loggedUser.roles.includes('admin')) {
                    return true;
                }

                if (loggedUser && loggedUser.roles.length === 0) {
                    this.router.navigate(['/auth/select-plan'], { queryParams: { teacher: true } });
                    return false;
                }

                return true;
            }),
        );
    }
}
