import { UserService } from './../../../@core/services/user.service';
import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
    selector: 'app-forgot-password-page',
    templateUrl: './forgot-password-page.component.html',
    styleUrls: ['./forgot-password-page.component.scss'],
})
export class ForgotPasswordPageComponent {
    error = '';

    constructor(private userService: UserService, private router: Router) {}

    onSendEmail(email: string): void {
        this.userService.forgotPassword(email).subscribe({
            next: (res) => {
                // TODO: treat errors and toasts
                if (res) {
                    this.router.navigate(['/auth/confirm-email']);
                }
            },
            error: (error) => {
                this.error = error;
            },
        });
    }
}
