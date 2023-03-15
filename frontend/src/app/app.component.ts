import { Component } from '@angular/core';
import { OnboardingService } from './@core/services/onboarding.service';
import { ThemeService } from './@core/services/theme.service';
import { UserService } from './@core/services/user.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    theme$ = this.themeService.theme$;

    /* Injected userService here to load the user 
     in the proper way to be used in the route guards */
    constructor(
        private userService: UserService,
        private themeService: ThemeService,
        private onboardingService: OnboardingService,
    ) {}
}
