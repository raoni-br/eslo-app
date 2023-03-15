import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Address } from 'app/@core/models/address.model';
import { PostalCodeService } from 'app/@core/services/postal-code.service';

// Brazilian Post Code API object
interface PostalCode {
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro: boolean;
}

@Component({
    selector: 'app-address-input',
    templateUrl: './address-input.component.html',
    styleUrls: ['./address-input.component.scss'],
})
export class AddressInputComponent implements OnChanges {
    @Input() address: Address;

    @Input() column: boolean;

    formAddress: FormGroup;

    constructor(private formBuilder: FormBuilder, private postalCodeService: PostalCodeService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['address']) {
            this.formAddress = this.formBuilder.group({
                postalCode: [this.address.postalCode, Validators.required],
                street: [this.address.street, Validators.required],
                streetNumber: [
                    this.address.streetNumber,
                    Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')]),
                ],
                streetComplement: [this.address.streetComplement],
                district: [this.address.district, Validators.required],
                city: [{ value: this.address.city, disabled: true }, Validators.required],
                state: [{ value: this.address.state, disabled: true }, Validators.required],
            });
        }
    }

    getAddress(): void {
        const postalCode = this.formAddress.controls['postalCode'].value;
        if (postalCode?.length === 8) {
            this.postalCodeService.getAddress(postalCode).subscribe((data: PostalCode) => {
                if (!data.erro) {
                    this.formAddress.patchValue({
                        street: `${data.logradouro}`,
                        streetComplement: `${data.complemento}`,
                        district: `${data.bairro}`,
                        city: `${data.localidade}`,
                        state: `${data.uf}`,
                    });
                } else {
                    this.formAddress.patchValue({
                        postalCode: '',
                        street: '',
                        streetComplement: '',
                        district: '',
                        city: '',
                        state: '',
                    });

                    alert('Postal Code not found\nPlease enter a valid Postal Code.');
                }
            });
        }
    }
}
