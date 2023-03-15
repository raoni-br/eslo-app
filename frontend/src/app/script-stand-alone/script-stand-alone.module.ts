import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScriptStandAlonePageComponent } from './pages/script-stand-alone-page/script-stand-alone-page.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/@shared/shared.module';
import { LayoutModule } from 'app/layout/layout.module';

const routes = [
    {
        path: '',
        component: ScriptStandAlonePageComponent,
    },
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), LayoutModule, SharedModule],
    declarations: [ScriptStandAlonePageComponent],
})
export class ScriptStandAloneModule {}
