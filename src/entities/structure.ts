import {GameObjects} from 'phaser';
import Scene = Phaser.Scene;

export class Structure extends GameObjects.Sprite {
  placed: boolean;

  constructor(scene: Scene, x: number, y: number, sprite) {
    super(scene, x, y, sprite);

    this.placed = false;
  }

  place() {
    this.placed = true;
    this.disableInteractive();
  }
}
