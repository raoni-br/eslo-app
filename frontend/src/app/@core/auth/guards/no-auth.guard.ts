import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserService } from '../../services/user.service';
import { UserSessionService } from 'app/@core/services/user-session.service';

@Injectable({
    providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
    constructor(
        private userService: UserService,
        private userSessionService: UserSessionService,
        public router: Router,
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.userService.loggedUser.pipe(
            map((loggedUser) => {
                if (loggedUser && this.userSessionService.getAuthToken()) {
                    if (loggedUser) {
                        this.router.navigate(['/']);
                    }

                    return false;
                }

                return true;
            }),
        );
    }
}
