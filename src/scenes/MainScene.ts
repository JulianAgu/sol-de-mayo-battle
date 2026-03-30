import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Boss } from '../entities/Boss';

export class MainScene extends Phaser.Scene {
    private player!: Player;
    private boss!: Boss;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    // Propiedades de estado del juego
    private lives: number = 3; // Valor inicial por defecto
    private lifeIcons!: Phaser.GameObjects.Group;

    constructor() {
        super('MainScene');
    }
    preload() {
        console.log("Generando texturas locales...");

        // Creamos un cuadrado celeste para Argentina
        const rectAr = this.add.graphics();
        rectAr.fillStyle(0x74ACDF); // Celeste
        rectAr.fillRect(0, 0, 32, 32);
        rectAr.generateTexture('sun-ar', 32, 32);
        rectAr.destroy();

        // Creamos un cuadrado amarillo para Uruguay
        const rectUy = this.add.graphics();
        rectUy.fillStyle(0xFCD116); // Amarillo
        rectUy.fillRect(0, 0, 32, 32);
        rectUy.generateTexture('sun-uy', 32, 32);
        rectUy.destroy();

        // Bala blanca simple
        const rectBullet = this.add.graphics();
        rectBullet.fillStyle(0xffffff);
        rectBullet.fillRect(0, 0, 8, 4);
        rectBullet.generateTexture('bullet-texture', 8, 4);
        rectBullet.destroy();

        // Bala roja para el enemigo
        const rectBulletEn = this.add.graphics();
        rectBulletEn.fillStyle(0xff0000);
        rectBulletEn.fillRect(0, 0, 8, 4);
        rectBulletEn.generateTexture('bullet-enemy', 8, 4);
        rectBulletEn.destroy();
    }

    create() {
        // RESET DE ESTADO: Obligamos a que las vidas vuelvan a 3 cada vez que inicia la escena
        this.lives = 3;

        const selection = this.registry.get('playerCountry') || 'AR';
        const playerTex = selection === 'AR' ? 'sun-ar' : 'sun-uy';
        const bossTex = selection === 'AR' ? 'sun-uy' : 'sun-ar';

        // 1. Inicializar el grupo de vidas ANTES de que algo pueda chocar
        this.lifeIcons = this.add.group();
        this.setupLivesUI(playerTex);

        // 2. Crear Entidades
        this.player = new Player(this, 100, 225, playerTex);
        this.boss = new Boss(this, 700, 225, bossTex);

        // 3. Controles
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        // 4. Colisiones
        this.physics.add.overlap(this.boss.getProjectiles(), this.player, this.handleBulletHitPlayer, undefined, this);
        this.physics.add.overlap(this.player.getProjectiles(), this.boss, this.handleBulletHitBoss, undefined, this);
    }
    /**
     * Crea los íconos de vida basados en el país elegido
     */
    private setupLivesUI(texture: string) {
        this.lifeIcons = this.add.group();

        for (let i = 0; i < this.lives; i++) {
            const icon = this.add.image(30 + (i * 35), 30, texture)
                .setScale(0.5) // Más chiquitos para el HUD
                .setAlpha(0.8);
            this.lifeIcons.add(icon);
        }
    }

    /**
     * Lógica cuando el jugador recibe daño
     */
    private handlePlayerHit() {
        // Verificación de seguridad (SOLID: Robustez)
        if (!this.player || this.player.isInvulnerable || this.lives <= 0) return;

        this.lives--;

        // Validamos que el grupo exista antes de pedir los hijos
        if (this.lifeIcons) {
            const icons = this.lifeIcons.getChildren();
            if (icons.length > 0) {
                const lastIcon = icons[icons.length - 1] as Phaser.GameObjects.Image;
                lastIcon.destroy();
            }
        }

        this.player.takeDamage();

        if (this.lives <= 0) {
            this.scene.start('MenuScene');
        }
    }

    private handleBulletHitPlayer(player: any, bullet: any) {
        // La bala del enemigo desaparece
        bullet.kill();

        // Llamamos al método de daño que creamos antes en el Player
        this.handlePlayerHit();
    }

    private handleBulletHitBoss(boss: any, bullet: any) {
        bullet.kill(); // La bala vuelve al pool
        (boss as Boss).setTint(0xff0000);
        this.time.delayedCall(100, () => (boss as Boss).clearTint());
        // Aquí podrías sumar puntos
    }

    private gameOver() {
        console.log("GAME OVER");
        this.scene.start('MenuScene'); // Reiniciar o ir a pantalla de puntajes
    }

    update(time: number) {
        this.player.updateLogic(this.cursors, time);

        // Ahora le pasamos el 'time' al boss para su lógica de ráfagas
        this.boss.updateLogic(time);
    }
}