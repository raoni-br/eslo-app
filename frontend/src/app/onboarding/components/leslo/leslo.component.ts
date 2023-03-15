import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import Phaser from 'phaser';

import { Example } from './phaser/scene';

@Component({
    selector: 'app-leslo',
    templateUrl: './leslo.component.html',
    styleUrls: ['./leslo.component.scss'],
})
export class LesloComponent implements AfterViewInit {
    game: Phaser.Game;

    @ViewChild('lesloFrame') lesloFrame: ElementRef;

    constructor() {}

    ngAfterViewInit() {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: this.lesloFrame.nativeElement,
            width: 275,
            height: 344,
            pixelArt: true,
            scene: [Example],
            transparent: true,
        };

        this.game = new Phaser.Game(config);
    }
}
