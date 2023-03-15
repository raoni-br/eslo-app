import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserProfile, UserIdentification, UserPhoneNumber, UserAddress } from 'app/@core/models/user-profile.model';
import { UserService } from 'app/@core/services/user.service';
import { AddressInputComponent } from 'app/@shared/components/forms/address-input/address-input.component';
@Component({
    selector: 'app-user-profile-form',
    templateUrl: './user-profile-form.component.html',
    styleUrls: ['./user-profile-form.component.scss'],
})
export class UserProfileFormComponent implements AfterViewInit {
    @ViewChild(AddressInputComponent)
    addressInputComponent: AddressInputComponent;

    userProfile: UserProfile;
    userIdentification: UserIdentification;
    userPhoneNumber: UserPhoneNumber;
    userAddress: UserAddress = {};

    userProfileForm: FormGroup;

    isSaving = false;
    errorMessage = '';

    constructor(
        private router: Router,
        private formBuilder: FormBuilder,
        private matSnackBar: MatSnackBar,
        private userService: UserService,
    ) {}

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.userService.getUserProfile().subscribe((userProfile: UserProfile) => {
                this.userProfile = { ...userProfile };
                delete this.userProfile.id;
                delete (this.userProfile as any).__typename;

                if (this.userProfile.dateOfBirth) {
                    this.userProfile.dateOfBirth = new Date(parseInt(this.userProfile.dateOfBirth, 10)).toISOString();
                }

                if (this.userProfile.userIdentificationList && this.userProfile.userIdentificationList.length > 0) {
                    this.userIdentification = this.userProfile.userIdentificationList[0];
                } else {
                    this.userIdentification = {
                        countryISO: 'BR',
                        category: 'CPF_CNPJ',
                        code: '',
                    };
                    this.userProfile.userIdentificationList = [this.userIdentification];
                }

                if (this.userProfile.userPhoneNumbers && this.userProfile.userPhoneNumbers.length > 0) {
                    this.userPhoneNumber = this.userProfile.userPhoneNumbers[0];
                } else {
                    this.userPhoneNumber = {
                        countryISO: 'BR',
                        category: 'PRIMARY',
                        code: 'MOBILE',
                        rawFormat: '',
                    };
                    this.userProfile.userPhoneNumbers = [this.userPhoneNumber];
                }

                if (this.userProfile.userAddresses && this.userProfile.userAddresses.length > 0) {
                    this.userAddress = this.userProfile.userAddresses[0];
                } else {
                    const userAddress = { countryISO: 'BR', addressType: 'BILLING' };
                    this.userProfile.userAddresses = [userAddress];
                }

                this.createUserForm();
            });
        });
    }

    createUserForm(): void {
        this.userProfileForm = this.formBuilder.group({
            email: [this.userProfile.primaryEmail],
            firstName: [
                this.userProfile.firstName,
                Validators.compose([Validators.required, Validators.pattern('^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$')]),
            ],
            familyName: [
                this.userProfile.familyName,
                Validators.compose([Validators.required, Validators.pattern('^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$')]),
            ],
            // dateOfBirth: [this.userProfile.dateOfBirth, Validators.required],
            documentId: [this.userIdentification.code, Validators.required],
            // phoneNumber: [
            //     this.userPhoneNumber.rawFormat,
            //     Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(11)]),
            // ],
        });
    }

    saveUserProfile(): void {
        this.isSaving = true;

        try {
            this.errorMessage = '';

            const updatedUserProfile = this.userProfileForm.getRawValue();
            this.userProfile.firstName = updatedUserProfile.firstName;
            this.userProfile.familyName = updatedUserProfile.familyName;
            this.userProfile.dateOfBirth = updatedUserProfile.dateOfBirth;

            const userProfile = JSON.parse(JSON.stringify(this.userProfile));

            delete (userProfile.userIdentificationList[0] as any).__typename;
            delete (userProfile.userAddresses[0] as any).__typename;
            delete userProfile.__typename;
            delete userProfile.id;

            userProfile.userIdentificationList[0].code = updatedUserProfile.documentId;
            delete userProfile.userPhoneNumbers;

            const updatedAddress = this.addressInputComponent.formAddress.getRawValue();
            userProfile.userAddresses[0].postalCode = updatedAddress.postalCode;
            userProfile.userAddresses[0].street = updatedAddress.street;
            userProfile.userAddresses[0].streetNumber = updatedAddress.streetNumber;
            userProfile.userAddresses[0].streetComplement = updatedAddress.streetComplement;
            userProfile.userAddresses[0].district = updatedAddress.district;
            userProfile.userAddresses[0].city = updatedAddress.city;
            userProfile.userAddresses[0].state = updatedAddress.state;

            this.userService.updateMyProfile(userProfile).subscribe((updatedUser: UserProfile) => {
                this.isSaving = false;
                if (updatedUser) {
                    this.userProfile = updatedUser;
                    this.matSnackBar.open('Profile updated successfully', 'OK', {
                        duration: 0,
                        panelClass: ['snackbar-panel', 'snackbar-panel--one-line'],
                    });
                } else {
                    // this.errorMessage = 'Your profile could not be saved.';
                    this.matSnackBar.open('Your profile could not be saved.', 'OK', {
                        duration: 0,
                        panelClass: ['snackbar-panel', 'snackbar-panel--one-line'],
                    });
                }
            });
        } catch (error: any) {
            this.isSaving = false;
            this.errorMessage = 'An error ocurred while saving your profile.';
            console.error('error saving profile', error);
        }
    }
}
