import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { UserService } from 'app/@core/services/user.service';

@Component({
    selector: 'app-create-account-form',
    templateUrl: './create-account-form.component.html',
    styleUrls: ['./create-account-form.component.scss'],
})
export class CreateAccountFormComponent implements OnChanges {
    @Input() defaultEmail: string;

    @Output() validateEmailEvent = new EventEmitter<string>();

    createAccountForm = this.fb.group({
        email: this.fb.control('', [Validators.required, Validators.email]),
    });

    constructor(private fb: FormBuilder, private userService: UserService) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes?.defaultEmail?.currentValue) {
            const email = decodeURI(changes?.defaultEmail?.currentValue);
            this.createAccountForm.patchValue({ email });
            this.onValidateEmail();
        }
    }

    onValidateEmail() {
        if (this.emailControl.invalid) {
            return;
        }
        this.validateEmailEvent.emit(this.emailControl.value);
    }

    get emailControl() {
        return this.createAccountForm.get('email') as FormControl;
    }
}
