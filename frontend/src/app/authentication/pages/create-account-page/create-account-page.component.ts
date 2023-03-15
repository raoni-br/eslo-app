import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'app/@core/services/user.service';

@Component({
    selector: 'app-create-account-page',
    templateUrl: './create-account-page.component.html',
    styleUrls: ['./create-account-page.component.scss'],
})
export class CreateAccountPageComponent implements OnInit {
    email: string;

    constructor(private route: ActivatedRoute, private userService: UserService, private router: Router) {}

    ngOnInit() {
        this.email = this.route.snapshot.queryParams?.email;
    }

    onValidateEmail(email: string) {
        this.userService.validateEmail(email).subscribe({
            next: (res) => {
                if (res?.message === `E-mail ${email} is already registered.`) {
                    this.router.navigate(['/auth/login'], { queryParams: { email } });
                }
            },
            error: (err) => {
                this.router.navigate(['/auth/register'], { queryParams: { email } });
            },
        });
    }
}
