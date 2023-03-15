import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'app/@core/services/user.service';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
    loginForm: FormGroup;

    showPassword = false;

    // loginFailed = false;

    @Input() loginFailed: { error: boolean; message: string };
    @Input() defaultEmail: string;

    @Output() loginEvent = new EventEmitter();

    /**
     * Constructor
     *
     * @param _fuseConfigService
     * @param _formBuilder
     */
    constructor(
        private _formBuilder: FormBuilder,
        private userService: UserService,
        private router: Router,
        private mediaObserver: MediaObserver,
    ) {
        // Configure the layout
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.loginForm = this._formBuilder.group({
            email: [environment.production ? '' : 'raoni@eslo.com.br', [Validators.required, Validators.email]],
            password: [
                environment.production ? '' : '!limaoMeiolimao2limoes',
                Validators.compose([Validators.required, Validators.minLength(8)]),
            ],
        });

        if (this.defaultEmail) {
            const email = decodeURI(this.defaultEmail);
            this.loginForm.get('email').patchValue(email);
        }
    }

    /**
     * Login user function
     */
    login(): void {
        const { email, password } = this.loginForm.value;
        this.loginEvent.emit({ email, password });
    }

    onToggleShowPassword() {
        this.showPassword = !this.showPassword;
    }
}
