import {GameObjects} from 'phaser';

export class Bar extends GameObjects.Graphics {
  fillPercent: number;
  fillColour: number;
  width: number;
  height: number;

  constructor(scene, options) {
    super(scene, options);

    this.fillPercent = options.fillPercent;
    this.fillColour = options.fillColour;
    this.width = options.width;
    this.height = options.height;

    this.setValue(this.fillPercent);
  }

  setValue(newValue: number) {
    this.fillPercent = Phaser.Math.Clamp(newValue, 0, 1);
    this.clear();
    this.fillStyle(this.fillColour, 1);
    this.fillRect(0, 0, this.width * this.fillPercent, this.height);
  }
}
