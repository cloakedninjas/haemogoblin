import Scene = Phaser.Scene;
import {Structure} from "./structure";

export class Tower extends Structure {
  placed: boolean;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'tower');
  }
}
