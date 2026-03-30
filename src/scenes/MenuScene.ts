import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.add.text(400, 100, 'ELIJE TU BANDO', { fontSize: '32px' }).setOrigin(0.5);

        // Botón Argentina
        const btnAr = this.add.text(400, 200, '🇦🇷 ARGENTINA', { fontSize: '24px', backgroundColor: '#005' })
            .setOrigin(0.5).setPadding(10).setInteractive({ useHandCursor: true });

        // Botón Uruguay
        const btnUy = this.add.text(400, 300, '🇺🇾 URUGUAY', { fontSize: '24px', backgroundColor: '#050' })
            .setOrigin(0.5).setPadding(10).setInteractive({ useHandCursor: true });

        btnAr.on('pointerdown', () => this.startGame('AR'));
        btnUy.on('pointerdown', () => this.startGame('UY'));
    }

    private startGame(selection: 'AR' | 'UY') {
        // Guardamos la elección globalmente
        this.registry.set('playerCountry', selection);
        this.scene.start('MainScene');
    }
}