import { BaseActor } from './BaseActor';
import { WeaponSystem } from './WeaponSystem';

export class Boss extends BaseActor {
    private weapon: WeaponSystem;
    private damageTaken: number = 0;
    private difficultyLevel: number = 1;
    private readonly hitsPerLevel: number = 2;
    private debugBar: Phaser.GameObjects.Graphics; 
    private shotsFiredInBurst: number = 0;
    private nextActionTime: number = 0;
    private isResting: boolean = false;
    
    // Referencias de posición inicial
    private startY: number;
    private startX: number; 

    // Acumuladores para evitar saltos de fase al cambiar velocidad
    private phaseY: number = 0;
    private phaseX: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        this.setScale(2).setFlipX(true);
        this.startY = y;
        this.startX = x;
        this.weapon = new WeaponSystem(scene, 'bullet-enemy');
        this.debugBar = scene.add.graphics();
    }

    // Gestiona daño recibido y progresión de nivel
    public registerHit(): void {
        this.damageTaken++;
        if (this.damageTaken % this.hitsPerLevel === 0) {
            this.difficultyLevel++;
            this.setTint(0xff0000);
            this.scene.time.delayedCall(200, () => this.clearTint());
        }
    }

    // Procesa movimiento, ataque y UI de depuración
    public updateLogic(time: number, delta: number): void {
        this.handleMovement(delta);
        this.handleShooting(time);
        this.drawDebugUI();
    }

    // Calcula posición mediante senos/cosenos con acumuladores para suavidad
    private handleMovement(delta: number): void {
        const speedBase = 0.002 + (this.difficultyLevel * 0.0005);
        const ampY = 50 + (this.difficultyLevel * 10);
        
        // Actualiza fase vertical independiente del tiempo absoluto
        this.phaseY += speedBase * delta;
        this.y = this.startY + Math.sin(this.phaseY) * ampY;

        // Movimiento horizontal a partir de Nivel 2
        if (this.difficultyLevel >= 2) {
            const speedX = speedBase * 0.8;
            const ampX = 30 + (this.difficultyLevel * 5);
            
            this.phaseX += speedX * delta;
            this.x = this.startX + Math.cos(this.phaseX) * ampX;
        }
    }

    // Controla tiempos de ráfaga y estados de descanso
    private handleShooting(time: number): void {
        if (time < this.nextActionTime) return;

        const maxShots = 4 + Math.floor(this.difficultyLevel / 2); 
        const rest = Math.max(500, 2000 - (this.difficultyLevel * 200));
        const burst = Math.max(100, 300 - (this.difficultyLevel * 20));

        if (this.isResting) {
            this.isResting = false;
            this.shotsFiredInBurst = 0;
            this.nextActionTime = time + 500; 
            return;
        }

        this.executeAttackPattern(time);
        this.shotsFiredInBurst++;

        if (this.shotsFiredInBurst >= maxShots) {
            this.isResting = true;
            this.nextActionTime = time + rest;
        } else {
            this.nextActionTime = time + burst;
        }
    }

    // Define el tipo de proyectiles según el nivel de dificultad
    private executeAttackPattern(time: number): void {
        const bx = this.x - 40;
        const by = this.y;

        // MODIFICAR AQUÍ: Nivel requerido para disparos en abanico
        if (this.difficultyLevel >= 2) {
            this.weapon.fire(bx, by, -1, 0, time);    
            this.weapon.fire(bx, by, -1, -0.3, time); 
            this.weapon.fire(bx, by, -1, 0.3, time);  
        } else {
            this.weapon.fire(bx, by, -1, 0, time);    
        }
    }

    // --- DEBUG-ONLY: Renderiza barra de progreso de nivel ---
    private drawDebugUI(): void {
        this.debugBar.clear();
        this.debugBar.fillStyle(0x333333, 0.8).fillRect(this.x - 50, this.y - 60, 100, 10);
        const progress = (this.damageTaken % this.hitsPerLevel) / this.hitsPerLevel;
        this.debugBar.fillStyle(0x00ff00, 1).fillRect(this.x - 50, this.y - 60, 100 * progress, 10);
    }
    // --------------------------------------------------------

    // Libera recursos gráficos
    public destroy(fromScene?: boolean) {
        if (this.debugBar) this.debugBar.destroy();
        super.destroy(fromScene);
    }

    // Acceso al grupo de proyectiles para colisiones
    public getProjectiles() { return this.weapon.getGroup(); }
}