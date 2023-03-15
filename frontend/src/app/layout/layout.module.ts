import { SystemBannerComponent } from './components/system-banner/system-banner.component';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { NavigationBarComponent } from './components/navigation-bar/navigation-bar.component';

import { LayoutComponent } from './layout.component';
import { SharedModule } from 'app/@shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { PortalModule } from '@angular/cdk/portal';
import { ClickOutsideModule } from 'ng-click-outside';
@NgModule({
    declarations: [LayoutComponent, NavigationBarComponent, TopBarComponent, SystemBannerComponent],
    imports: [
        CommonModule,
        RouterModule,
        MatRippleModule,
        MatCardModule,
        FlexLayoutModule,
        PortalModule,
        ClickOutsideModule,
        SharedModule,
    ],
    exports: [LayoutComponent],
})
export class LayoutModule {}
