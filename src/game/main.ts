import { AUTO, Game } from 'phaser';
import { PlatformerDemo } from './scenes/PlatformerDemo';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 }, // We handle gravity manually for apex modifier
            debug: false
        }
    },
    scene: [
        PlatformerDemo
    ],
    render: {
        pixelArt: false,
        antialias: true
    }
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
