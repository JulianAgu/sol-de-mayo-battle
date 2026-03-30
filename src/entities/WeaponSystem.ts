import { Projectile } from './Projectile';

export class WeaponSystem {
    private group: Phaser.Physics.Arcade.Group;
    private lastFired = 0;
    private readonly COOLDOWN = 200; // Milisegundos entre disparos

    constructor(scene: Phaser.Scene, texture: string) {
        // Creamos un Pool de objetos para optimizar (Object Pooling)
        this.group = scene.physics.add.group({
            classType: Projectile,
            maxSize: 20, // Máximo 20 balas en pantalla
            runChildUpdate: true // Esto permite que el update de la bala se ejecute
        });

        // Llenamos el pool con la textura indicada
        this.group.createMultiple({
            key: texture,
            active: false,
            visible: false,
            quantity: 20
        });
    }

    public fire(x: number, y: number, direction: number, time: number) {
        if (time < this.lastFired) return;

        const bullet = this.group.getFirstDead(false) as Projectile;

        if (bullet) {
            bullet.fire(x, y, direction * 500);
            this.lastFired = time + this.COOLDOWN;
        }
    }

    public getGroup() { return this.group; }
}