import { UserService } from 'app/@core/services/user.service';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-reset-password-page',
    templateUrl: './reset-password-page.component.html',
    styleUrls: ['./reset-password-page.component.scss'],
})
export class ResetPasswordPageComponent {
    constructor(
        private userService: UserService,
        private router: Router,
        private route: ActivatedRoute,
        private matSnackBar: MatSnackBar,
    ) {}

    onResetPassword(newPassword: string) {
        const resetPasswordToken = this.route.snapshot.params.resetPasswordToken;

        this.userService.resetPassword(resetPasswordToken, newPassword).subscribe({
            next: (res) => {
                // TODO: treat errors and toasts
                if (res) {
                    this.router.navigate(['/auth/login']);

                    this.matSnackBar.open(res.message, 'Ok', {
                        duration: 0,
                        panelClass: ['snackbar-panel', 'snackbar-panel--one-line'],
                    });
                }
            },
            error: (err) => {
                this.matSnackBar.open(err, 'Ok', {
                    duration: 0,
                    panelClass: ['snackbar-panel', 'snackbar-panel--one-line'],
                });
            },
        });
    }
}
