import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
    private finalScore: number = 0;

    constructor() {
        super('GameOverScene');
    }

    // Phaser llama automáticamente a init con los datos pasados desde scene.start()
    init(data: { score: number }) {
        this.finalScore = data.score || 0;
    }

    create() {
        const { width, height } = this.scale;

        // 1. Título
        this.add.text(width / 2, height / 2 - 50, 'GAME OVER', {
            fontSize: '64px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 2. Puntaje Total
        this.add.text(width / 2, height / 2 + 20, `Puntaje Total: ${this.finalScore}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 3. Botón Reintentar (POO: Objeto interactivo)
        const retryBtn = this.add.text(width / 2, height / 2 + 100, 'VOLVER AL MENÚ', {
            fontSize: '24px',
            backgroundColor: '#333',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        // Efectos del botón
        retryBtn.on('pointerover', () => retryBtn.setStyle({ backgroundColor: '#555' }));
        retryBtn.on('pointerout', () => retryBtn.setStyle({ backgroundColor: '#333' }));
        
        // Al hacer click, volvemos a la escena de selección de país (MenuScene)
        retryBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}