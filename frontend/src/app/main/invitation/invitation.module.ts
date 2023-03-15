import { NgModule } from '@angular/core';

import { WelcomeModule } from './welcome/welcome.module';
import { MessageModule } from './message/message.module';
import { TransferModule } from './transfer/transfer.module';

@NgModule({
    imports: [WelcomeModule, TransferModule, MessageModule],
})
export class InvitationModule {}
