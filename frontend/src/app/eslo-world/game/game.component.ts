import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';
import { DemoScene } from '../scenes/demo.scene';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
    public game: Phaser.Game;

    constructor() {}

    ngOnInit(): void {
        const config: Phaser.Types.Core.GameConfig = {
            width: 1024,
            height: 768,
            type: Phaser.AUTO,
            title: 'eslo world',
            scene: [DemoScene],
            parent: 'game-container',
            backgroundColor: 'ffffff',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false,
                },
            },
        };

        this.game = new Phaser.Game(config);
    }
}
