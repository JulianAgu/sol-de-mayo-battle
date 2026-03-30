import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Boss } from '../entities/Boss';

export class MainScene extends Phaser.Scene {
    private player!: Player;
    private boss!: Boss;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private score: number = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private scoreTimer!: Phaser.Time.TimerEvent;

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
        this.score = 0;

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

        // 1. Crear el texto del Score (UI)
        this.scoreText = this.add.text(780, 20, 'Score: 0', {
            fontSize: '24px',
            color: '#fff',
            fontFamily: 'Arial' // Luego podés usar una fuente pixel art
        }).setOrigin(1, 0);

        // 2. Configurar puntos pasivos: 10 puntos cada 5 segundos (S de SOLID: Timer independiente)
        this.scoreTimer = this.time.addEvent({
            delay: 5000,
            callback: () => this.addPoints(10),
            callbackScope: this,
            loop: true
        });

        // 4. Colisiones
        this.physics.add.overlap(this.boss.getProjectiles(), this.player, this.handleBulletHitPlayer, undefined, this);
        this.physics.add.overlap(this.player.getProjectiles(), this.boss, this.handleBulletHitBoss, undefined, this);

    }
    private addPoints(amount: number) {
        this.score += amount;
        // Forzamos la actualización del texto en pantalla
        if (this.scoreText) {
            this.scoreText.setText(`Score: ${this.score}`);
        }
    }

    private isBossObject(obj: any): obj is Boss {
        return !!obj && typeof obj.registerHit === 'function';
    }

    private getProjectileFromOverlap(obj1: any, obj2: any): any | null {
        if (obj1 && typeof obj1.kill === 'function') return obj1;
        if (obj2 && typeof obj2.kill === 'function') return obj2;
        return null;
    }

    /// Colisión bala jugador -> boss
    private handleBulletHitBoss(obj1: any, obj2: any) {
        console.log("¡Impacto detectado!"); // Si ves esto en la consola, la colisión funciona

        const bullet = this.getProjectileFromOverlap(obj1, obj2);
        const boss = this.isBossObject(obj1) ? obj1 : (this.isBossObject(obj2) ? obj2 : null);

        if (!bullet || !boss) {
            return;
        }

        // 1. "Matamos" la bala del pool inmediatamente
        // Usamos 'as any' o el tipo correcto para acceder al método kill()
        if (bullet.kill) {
            bullet.kill();
        } else {
            bullet.destroy(); // Plan B si kill no está definido
        }

        // 2. Sumamos puntos
        this.addPoints(5);

        // 3. Subimos daño/acumulador del boss para escalar dificultad
        boss.registerHit();

        // 4. Feedback visual (Opcional pero recomendado)
        const b = boss as Phaser.GameObjects.Sprite;
        b.setTint(0xff0000);
        this.time.delayedCall(100, () => b.clearTint());
    }

    private gameOver() {
        // Detener el timer de puntos antes de salir
        if (this.scoreTimer) this.scoreTimer.destroy();

        // Pasamos el score a la siguiente escena mediante el objeto de datos
        this.scene.start('GameOverScene', { score: this.score });
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
        if (this.player.isInvulnerable || this.lives <= 0) return;

        this.lives--;

        // Actualizar UI de vidas
        if (this.lifeIcons) {
            const icons = this.lifeIcons.getChildren();
            const lastIcon = icons[icons.length - 1] as Phaser.GameObjects.Image;
            if (lastIcon) lastIcon.destroy();
        }

        this.player.takeDamage();

        // --- CORRECCIÓN AQUÍ ---
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    private handleBulletHitPlayer(bullet: any, player: any) {
        const projectile = this.getProjectileFromOverlap(bullet, player);

        if (!projectile) {
            return;
        }

        // La bala del enemigo desaparece
        if (projectile.kill) {
            projectile.kill();
        } else {
            projectile.destroy();
        }

        // Llamamos al método de daño que creamos antes en el Player
        this.handlePlayerHit();
    }

    update(time: number, delta: number) {
        if (this.player) {
            this.player.updateLogic(this.cursors, time);
        }

        if (this.boss) {
            // ERROR COMÚN: Si falta 'delta', el jefe desaparece
            this.boss.updateLogic(time, delta);
        }

        if (this.bg) {
            this.bg.update();
        }
    }


}