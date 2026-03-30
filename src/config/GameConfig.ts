import Phaser from 'phaser';
import { MainScene } from '../scenes/MainScene';
import { MenuScene } from '../scenes/MenuScene';
import { GameOverScene } from '../scenes/GameOverScene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 450, // Formato 16:9 horizontal
    physics: {
        default: 'arcade',
        arcade: { 
            debug: false, // Cambiá a true si querés ver las cajas de colisión
            gravity: { x: 0, y: 0 } 
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MenuScene, MainScene, GameOverScene] // Registramos la escena principal
};