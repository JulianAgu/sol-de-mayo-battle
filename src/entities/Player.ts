import { BaseActor } from './BaseActor';
import { WeaponSystem } from './WeaponSystem';

/**
 * Entidad controlada por el usuario.
 * Maneja movimiento en 4 direcciones, sistema de disparo con cooldown e invulnerabilidad.
 */
export class Player extends BaseActor {
    private readonly SPEED: number = 300;
    private weapon: WeaponSystem;
    private ctrlKey: Phaser.Input.Keyboard.Key | undefined;
    
    // Variables de control de disparo
    private lastFired: number = 0;
    private readonly COOLDOWN: number = 200;

    public isInvulnerable: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        
        this.setCollideWorldBounds(true);
        this.weapon = new WeaponSystem(scene, 'bullet-texture');

        if (scene.input.keyboard) {
            this.ctrlKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
        }
    }

    /**
     * Ciclo de actualización: procesa inputs de movimiento y disparo.
     */
    public updateLogic(cursors: Phaser.Types.Input.Keyboard.CursorKeys, time: number): void {
        if (!cursors) return;

        this.setVelocity(0);

        // Movimiento vertical
        if (cursors.up.isDown) this.setVelocityY(-this.SPEED);
        else if (cursors.down.isDown) this.setVelocityY(this.SPEED);

        // Movimiento horizontal
        if (cursors.left.isDown) this.setVelocityX(-this.SPEED);
        else if (cursors.right.isDown) this.setVelocityX(this.SPEED);

        // Activación de arma
        if (this.ctrlKey && this.ctrlKey.isDown) {
            this.fireWeapon(time);
        }
    }

    /**
     * Ejecuta el disparo recto si ha transcurrido el tiempo de cooldown.
     */
    private fireWeapon(time: number): void {
        if (time > this.lastFired) {
            this.weapon.fire(this.x + 20, this.y, 1, 0);
            this.lastFired = time + this.COOLDOWN;
        }
    }

    /**
     * Retorna grupo de proyectiles para gestión de colisiones en la escena.
     */
    public getProjectiles(): Phaser.Physics.Arcade.Group {
        return this.weapon.getGroup();
    }

    /**
     * Inicia estado de invulnerabilidad y efecto visual de parpadeo.
     */
    public takeDamage(): void {
        if (this.isInvulnerable) return;

        this.isInvulnerable = true;

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