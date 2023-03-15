import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CreatePasswordStudentInfo } from 'app/@core/models/invitation.model';
import { UserAddress } from 'app/@core/models/user-profile.model';
import { AddressInputComponent } from 'app/@shared/components/forms/address-input/address-input.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-register-form',
    templateUrl: './register-form.component.html',
    styleUrls: ['./register-form.component.scss'],
})
export class RegisterFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input() defaultEmail: string;
    @Input() registerFailed: boolean;

    @Input() studentInfo: CreatePasswordStudentInfo;

    @Output() registerEvent = new EventEmitter();

    @ViewChild(AddressInputComponent)
    addressInputComponent: AddressInputComponent;

    showPassword = false;

    userAddress: UserAddress = {};

    registerForm: FormGroup = this._formBuilder.group({
        // earlyAccessCode: ['', Validators.compose([Validators.required])],
        firstName: ['', Validators.compose([Validators.required, Validators.pattern('^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$')])],
        lastName: ['', Validators.compose([Validators.required, Validators.pattern('^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$')])],
        email: ['', [Validators.required, Validators.email]],
        cpf: ['', [Validators.required]],
        // dateOfBirth: ['', Validators.required],
        password: [
            '',
            Validators.compose([
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(28),
                Validators.pattern(/^(?=.*[A-Z])(?=.*[\W])(?=.*[0-9])(?=.*[a-z]).{8,64}$/),
            ]),
        ],
        passwordConfirm: ['', [Validators.required, confirmPasswordValidator]],
        terms: ['', Validators.requiredTrue],
    });

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(private _formBuilder: FormBuilder) {
        // Configure the layout

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Update the validity of the 'passwordConfirm' field
        // when the 'password' field changes
        this.registerForm
            .get('password')
            .valueChanges.pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.registerForm.get('passwordConfirm').updateValueAndValidity();
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.defaultEmail?.currentValue) {
            const email = decodeURI(changes?.defaultEmail?.currentValue);
            this.registerForm.get('email').patchValue(email);
        }

        if (changes?.studentInfo?.currentValue) {
            const { email, firstName, surname: lastName } = this.studentInfo;

            this.registerForm.patchValue({
                email,
                firstName,
                lastName,
            });
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    register(): void {
        const { terms, passwordConfirm, ...rest } = this.registerForm.getRawValue();

        const registerValues = {
            ...rest,
            ...this.addressInputComponent.formAddress.getRawValue(),
            countryISO: 'BR',
            addressType: 'BILLING',
            category: 'PRIMARY',
        };

        this.registerEvent.emit(registerValues);
    }

    showDialogTermsAndConditions(): void {
        window.open('http://eslo.com.br/termos-e-condicoes/', '_blank');
    }

    onToggleShowPassword() {
        this.showPassword = !this.showPassword;
    }
}

/**
 * Confirm password validator
 *
 * @param control
 * @returns
 */
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent || !control) {
        return null;
    }

    const password = control.parent.get('password');
    const passwordConfirm = control.parent.get('passwordConfirm');

    if (!password || !passwordConfirm) {
        return null;
    }

    if (passwordConfirm.value === '') {
        return null;
    }

    if (password.value === passwordConfirm.value) {
        return null;
    }

    return { passwordsNotMatching: true };
};
