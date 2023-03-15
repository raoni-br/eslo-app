import { Injectable } from '@angular/core';
import {
    Router,
    CanActivate,
    CanActivateChild,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    UrlTree,
} from '@angular/router';
import { UserSessionService } from 'app/@core/services/user-session.service';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserService } from '../../services/user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
    constructor(
        private router: Router,
        private userService: UserService,
        private userSessionService: UserSessionService,
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | UrlTree {
        return this.userService.loggedUser.pipe(
            map((loggedUser) => {
                if (!loggedUser && !this.userSessionService.getAuthToken()) {
                    this.router.navigate(['/auth/login']);
                    return false;
                }

                return true;
            }),
        );
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | UrlTree {
        return this.canActivate(route, state);
    }
}
