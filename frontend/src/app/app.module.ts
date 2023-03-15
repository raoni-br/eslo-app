import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
// App modules
import { CoreModule } from './@core/core.module';
import { AuthModule } from './@core/auth/auth.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,

        // App modules
        AppRoutingModule,
        CoreModule,
        AuthModule,

        MatSidenavModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor() {
        console.clear();
    }
}
