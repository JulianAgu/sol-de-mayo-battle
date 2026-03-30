export class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
    }
    
    // Método para disparar la bala
    public fire(x: number, y: number, velocityX: number) {
        this.enableBody(true, x, y, true, true); // Activa la bala en la posición
        this.setVelocityX(velocityX);
    }

    update() {
        // Si la bala sale de los límites de la pantalla, la "matamos" para reusarla
        if (this.x > 800 || this.x < 0) {
            this.kill();
        }
    }

   public kill() {
        this.setActive(false);
        this.setVisible(false);
        this.body!.enable = false; // Desactivar física es lo más importante
    }

    public fire(x: number, y: number, velocityX: number) {
        this.body!.reset(x, y); // Resetea posición y velocidad
        this.setActive(true);
        this.setVisible(true);
        this.body!.enable = true; 
        this.setVelocityX(velocityX);
    }
}