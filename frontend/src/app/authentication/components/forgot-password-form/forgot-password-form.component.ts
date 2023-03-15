import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

@Component({
    selector: 'app-forgot-password-form',
    templateUrl: './forgot-password-form.component.html',
    styleUrls: ['./forgot-password-form.component.scss'],
})
export class ForgotPasswordFormComponent implements OnInit {
    forgotPasswordForm: FormGroup;

    @Input() error: string;

    @Output() sendEmailEvent = new EventEmitter();

    /**
     * Constructor
     *
     * @param _fuseConfigService
     * @param _formBuilder
     */
    constructor(private _formBuilder: FormBuilder) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.forgotPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
        });
    }

    onSendEmail(): void {
        const email = this.emailControl.value;

        this.sendEmailEvent.emit(email);
    }

    get emailControl(): AbstractControl {
        return this.forgotPasswordForm.get('email');
    }
}
