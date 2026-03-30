// src/entities/Boss.ts
import { BaseActor } from './BaseActor';
import { WeaponSystem } from './WeaponSystem';

export class Boss extends BaseActor {
    private weapon: WeaponSystem;
    
    // Variables de control de ráfaga
    private shotsFiredInBurst: number = 0;
    private readonly MAX_SHOTS_PER_BURST: number = 4;
    private nextActionTime: number = 0;
    private isResting: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        this.setScale(2);
        this.setFlipX(true);
        
        // El Boss usa la misma clase WeaponSystem (Reutilización!)
        // Usamos una textura de bala distinta para el enemigo
        this.weapon = new WeaponSystem(scene, 'bullet-enemy');
    }

    public updateLogic(time: number): void {
        if (time < this.nextActionTime) return;

        if (this.isResting) {
            // Fin del descanso: resetear para la nueva ráfaga
            this.isResting = false;
            this.shotsFiredInBurst = 0;
            this.nextActionTime = time + 500; // Pequeña pausa antes de empezar a tirar
            return;
        }

        // Ejecutar disparo de la ráfaga
        this.weapon.fire(this.x - 40, this.y, -1, time); // Dirección -1 (Izquierda)
        this.shotsFiredInBurst++;

        if (this.shotsFiredInBurst >= this.MAX_SHOTS_PER_BURST) {
            // Entrar en modo descanso
            this.isResting = true;
            this.nextActionTime = time + 2000; // Descanso de 2 segundos
        } else {
            // Intervalo corto entre balas de la misma ráfaga
            this.nextActionTime = time + 300; 
        }
    }

    public getProjectiles() {
        return this.weapon.getGroup();
    }
}