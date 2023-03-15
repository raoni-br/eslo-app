import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MessageComponent } from './message.component';
import { SharedModule } from 'app/@shared/shared.module';

const routes = [
    {
        path: 'message/:status',
        component: MessageComponent,
    },
];

@NgModule({
    declarations: [MessageComponent],
    imports: [RouterModule.forChild(routes), SharedModule],
})
export class MessageModule {}
