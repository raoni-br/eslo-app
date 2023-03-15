export class Example extends Phaser.Scene {
    constructor() {
        super({});
    }

    preload() {
        this.load.spritesheet('brawler', '../../../../../assets/eslo-world/brawler48x48.png', {
            frameWidth: 48,
            frameHeight: 48,
        });
    }

    create() {
        // Animation set
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('brawler', { frames: [0, 1, 2, 3] }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('brawler', { frames: [5, 6, 7, 8] }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: 'kick',
            frames: this.anims.generateFrameNumbers('brawler', { frames: [10, 11, 12, 13, 10] }),
            frameRate: 8,
            repeat: -1,
            repeatDelay: 2000,
        });

        this.anims.create({
            key: 'punch',
            frames: this.anims.generateFrameNumbers('brawler', { frames: [15, 16, 17, 18, 17, 15] }),
            frameRate: 8,
            repeat: -1,
            repeatDelay: 2000,
        });

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('brawler', { frames: [20, 21, 22, 23] }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: 'jumpkick',
            frames: this.anims.generateFrameNumbers('brawler', { frames: [20, 21, 22, 23, 25, 23, 22, 21] }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: 'win',
            frames: this.anims.generateFrameNumbers('brawler', { frames: [30, 31] }),
            frameRate: 8,
            repeat: -1,
            repeatDelay: 2000,
        });

        this.anims.create({
            key: 'die',
            frames: this.anims.generateFrameNumbers('brawler', { frames: [35, 36, 37] }),
            frameRate: 8,
        });

        const keys = ['walk', 'idle', 'kick', 'punch', 'jump', 'jumpkick', 'win', 'die'];

        const cody = this.add.sprite(150, 150, '');
        cody.setScale(8);
        cody.play('walk');

        let c = 0;
        this.input.on('pointerdown', function () {
            c++;
            if (c === keys.length) {
                c = 0;
            }
            cody.play(keys[c]);
        });
    }
}
