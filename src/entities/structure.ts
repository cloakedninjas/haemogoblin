import {GameObjects} from 'phaser';
import Scene = Phaser.Scene;

export class Structure extends GameObjects.Sprite {
  static EVENT_ATTACK: string = 'attack';
  placed: boolean;
  mapPosition: {
    x: number,
    y: number
  };

  constructor(scene: Scene, x: number, y: number, sprite) {
    super(scene, x, y, sprite);

    this.placed = false;
  }

  place(x: number, y: number) {
    this.placed = true;
    this.mapPosition = {x, y};
    this.disableInteractive();
  }

  trigger() {
  }
}
