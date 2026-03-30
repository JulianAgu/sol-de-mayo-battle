import { BaseActor } from './BaseActor';
import { WeaponSystem } from './WeaponSystem';

export class Player extends BaseActor {
    // 1. Definimos la velocidad (Esto era lo que faltaba para que se mueva)
    private readonly SPEED: number = 300;
    
    private weapon: WeaponSystem;
    private ctrlKey: Phaser.Input.Keyboard.Key | undefined;

    // Estado de vulnerabilidad
    public isInvulnerable: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        
        // Configuración física básica
        this.setCollideWorldBounds(true);

        // Inicializamos el sistema de armas (SOLID: S)
        this.weapon = new WeaponSystem(scene, 'bullet-texture');

        // Configuración segura del teclado
        if (scene.input.keyboard) {
            this.ctrlKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
        }
    }

    /**
     * Lógica de actualización del jugador
     * @param cursors Teclas de dirección
     * @param time Tiempo actual del motor (para el cooldown de disparos)
     */
    public updateLogic(cursors: Phaser.Types.Input.Keyboard.CursorKeys, time: number): void {
        // Protección contra nulos
        if (!cursors) return;

        // Reset de velocidad en cada frame para evitar deslizamientos infinitos
        this.setVelocity(0);

        // --- MOVIMIENTO ---
        // Eje Y (Vertical)
        if (cursors.up.isDown) {
            this.setVelocityY(-this.SPEED);
        } else if (cursors.down.isDown) {
            this.setVelocityY(this.SPEED);
        }

        // Eje X (Lateral)
        if (cursors.left.isDown) {
            this.setVelocityX(-this.SPEED);
        } else if (cursors.right.isDown) {
            this.setVelocityX(this.SPEED);
        }

        // --- DISPARO ---
        // Verificamos si la tecla existe y está presionada
        if (this.ctrlKey && this.ctrlKey.isDown) {
            this.fireWeapon(time);
        }
    }

    private fireWeapon(time: number): void {
        // El arma dispara hacia la derecha (dirección 1)
        this.weapon.fire(this.x + 20, this.y, 1, time);
    }

    /**
     * Expone el grupo de proyectiles para el sistema de colisiones de la escena
     */
    public getProjectiles(): Phaser.Physics.Arcade.Group {
        return this.weapon.getGroup();
    }

    /**
     * Aplica lógica de daño y feedback visual (parpadeo)
     */
    public takeDamage(): void {
        if (this.isInvulnerable) return;

        this.isInvulnerable = true;

        // Feedback visual: Tween de parpadeo (transparencia)
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.isInvulnerable = false;
                this.alpha = 1;
            }
        });
    }
}