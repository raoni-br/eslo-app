import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TokenValidation } from '../token-validation.interface';
import { UserAccountService } from '../user-account.service';

@Component({
    selector: 'app-confirm-registration',
    templateUrl: './confirm-registration.component.html',
    styleUrls: ['./confirm-registration.component.scss'],
})
export class ConfirmRegistrationComponent {
    public tokenVerified: TokenValidation;

    constructor(
        private userAccountService: UserAccountService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
    ) {
        this.activatedRoute.params.subscribe((params) => this.validateToken(params['registrationToken']));
    }

    private validateToken(registrationToken: string): void {
        this.userAccountService.validateRegistrationToken(registrationToken).subscribe(
            (tokenVerified) => {
                this.tokenVerified = tokenVerified;
            },
            (error: string) => {
                this.tokenVerified = {
                    tokenValidated: false,
                    message: error,
                };
            },
        );
    }

    public loginRedirect(): void {
        this.router.navigate(['auth', 'login']);
    }
}
