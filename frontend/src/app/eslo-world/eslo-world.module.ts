import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { SharedModule } from 'app/@shared/shared.module';

const routes: Routes = [
    {
        path: '',
        component: GameComponent,
    },
];

@NgModule({
    declarations: [GameComponent],
    imports: [RouterModule.forChild(routes), SharedModule],
})
export class EsloWorldModule {}
