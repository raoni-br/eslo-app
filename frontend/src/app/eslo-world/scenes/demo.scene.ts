export class DemoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'demo-scene' });
    }

    init(): void {}

    preload(): void {
        this.load.image('rogue-city-tileset', '/assets/eslo-world/tilesets/roguelikeCity_transparent.png');
        this.load.tilemapTiledJSON('demo-map', 'assets/eslo-world/maps/demo-map.json');
        // this.anims
    }

    create(): void {
        const map = this.make.tilemap({ key: 'demo-map' });
        const tileset = map.addTilesetImage('rogue-city', 'rogue-city-tileset');

        const layer = map.createLayer('Tile Layer 1', tileset);

        const marker = this.add.graphics();
        marker.lineStyle(2, 0x000000, 1);
        // marker.drawRect(0, 0, 32, 32);
    }

    update(): void {}
}
