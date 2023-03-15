import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';

import { TransferComponent } from './transfer.component';
import { TransferService } from './transfer.service';

import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'app/@shared/shared.module';

const routes = [
    {
        path: 'transfer/:invitationToken',
        component: TransferComponent,
        resolve: {
            invitation: TransferService,
        },
    },
];

@NgModule({
    declarations: [TransferComponent],
    imports: [RouterModule.forChild(routes), MatCheckboxModule, MatDialogModule, ReactiveFormsModule, SharedModule],
    providers: [TransferService],
})
export class TransferModule {}
