import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserService } from '../../services/user.service';

@Injectable({ providedIn: 'root' })
export class ProfileGuard implements CanActivate {
    constructor(private router: Router, private userService: UserService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | UrlTree {
        return this.userService.loggedUser.pipe(
            map((loggedUser) => {
                if (!loggedUser?.profileComplete) {
                    if (loggedUser) {
                        this.router.navigate(['/profile/account']);
                    }

                    return false;
                }

                return true;
            }),
        );
    }
}
