import { Projectile } from './Projectile';

/**
 * Gestiona el pool de proyectiles y su activación física.
 */
export class WeaponSystem {
    private group: Phaser.Physics.Arcade.Group;

    constructor(scene: Phaser.Scene, texture: string) {
        // Pool de objetos para optimizar memoria
        this.group = scene.physics.add.group({
            classType: Projectile,
            maxSize: 30, // Aumentado para soportar disparos triples
            runChildUpdate: true 
        });

        // Pre-carga de proyectiles desactivados
        this.group.createMultiple({
            key: texture,
            active: false,
            visible: false,
            quantity: 30
        });
    }

    /**
     * Activa un proyectil del pool y le asigna velocidad.
     */
    public fire(x: number, y: number, dirX: number, dirY: number) {
        const bullet = this.group.getFirstDead(false) as Projectile;
        
        if (bullet) {
            // Reinicia posición y activa física
            bullet.fire(x, y, dirX * 500);
            // Aplica trayectoria vertical para diagonales
            bullet.setVelocityY(dirY * 500);
        }
    }

    public getGroup() { return this.group; }
}