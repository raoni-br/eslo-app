import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UserAuthDetails, UserProfile } from 'app/@core/models/user-profile.model';

import { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

import { UserService } from '../../services/user.service';

@Injectable({ providedIn: 'root' })
export class OnboardingCompletedGuard implements CanActivate {
    constructor(private router: Router, private userService: UserService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | UrlTree {
        return this.userService.getUserProfile().pipe(
            withLatestFrom(this.userService.loggedUser),
            map(([userProfile, user]: [UserProfile, UserAuthDetails]) => {
                if (!user.roles.includes('teacher')) {
                    return true;
                }

                if (!userProfile.onboardingSubmitted) {
                    this.router.navigate(['/onboarding']);
                    return false;
                }

                return true;
            }),
        );
    }
}
