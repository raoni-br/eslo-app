import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { AuthErrorHandler } from './interceptors/auth-error-handler.interceptor';

import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
    imports: [AuthRoutingModule],
    declarations: [],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: JwtInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthErrorHandler,
            multi: true,
        },
    ],
})
export class AuthModule {}
