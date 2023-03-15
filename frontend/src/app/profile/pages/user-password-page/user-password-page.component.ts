import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { switchMap } from 'rxjs/operators';

import { UserService } from 'app/@core/services/user.service';

export class PasswordValidation {
    static MatchPassword(ac: AbstractControl): void {
        const password = ac.get('password').value;
        const passwordConfirm = ac.get('passwordConfirm').value;
        if (password !== passwordConfirm) {
            return ac.get('passwordConfirm').setErrors({ matchPassword: true });
        }

        return;
    }
}

@Component({
    selector: 'app-user-password-page',
    templateUrl: './user-password-page.component.html',
    styleUrls: ['./user-password-page.component.scss'],
})
export class UserPasswordPageComponent implements OnInit {
    userPasswordForm: FormGroup;

    constructor(private formBuilder: FormBuilder, private userService: UserService) {}

    ngOnInit(): void {
        this.createUserPasswordForm();
    }

    createUserPasswordForm(): void {
        this.userPasswordForm = this.formBuilder.group(
            {
                oldPassword: [
                    null,
                    Validators.compose([
                        Validators.required,
                        Validators.minLength(8),
                        Validators.maxLength(28),
                        Validators.pattern(/^(?=.*[A-Z])(?=.*[\W])(?=.*[0-9])(?=.*[a-z]).{8,64}$/),
                    ]),
                ],
                password: [
                    '',
                    Validators.compose([
                        Validators.required,
                        Validators.minLength(8),
                        Validators.maxLength(28),
                        Validators.pattern(/^(?=.*[A-Z])(?=.*[\W])(?=.*[0-9])(?=.*[a-z]).{8,64}$/),
                    ]),
                ],
                passwordConfirm: ['', [Validators.required]],
            },
            { validator: PasswordValidation.MatchPassword },
        );
    }

    onUpdate(): void {
        const { oldPassword, password: newPassword } = this.userPasswordForm.value;

        this.userService.loggedUser
            .pipe(
                switchMap((user) => {
                    const changePasswordInput = {
                        userEmail: user.primaryEmail,
                        oldPassword,
                        newPassword,
                    };

                    return this.userService.changePassword(changePasswordInput);
                }),
            )
            .subscribe({
                next: () => {
                    // TODO: confirmation message?
                },
            });
    }
}
