import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ModalConfirmationDataOptions {
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

@Component({
    selector: 'app-modal-confirmation',
    templateUrl: './modal-confirmation.component.html',
    styleUrls: ['./modal-confirmation.component.scss'],
})
export class ModalConfirmationComponent {
    constructor(
        public dialogRef: MatDialogRef<ModalConfirmationComponent>,
        @Inject(MAT_DIALOG_DATA) private data: ModalConfirmationDataOptions,
    ) {
        this.dialogRef.addPanelClass('dialog-border-radius--padding');
    }

    get title(): string {
        return this.data?.title;
    }

    get message(): string {
        return this.data?.message ?? 'Are you sure you want to continue this action?';
    }

    get confirmLabel(): string {
        return this.data?.confirmLabel ?? 'Confirm';
    }

    get cancelLabel(): string {
        return this.data?.cancelLabel ?? 'Cancel';
    }
}
