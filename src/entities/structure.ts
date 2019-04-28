import {GameObjects} from 'phaser';
import Scene = Phaser.Scene;
import {Hero} from "./hero";
import TimerEvent = Phaser.Time.TimerEvent;

export class Structure extends GameObjects.Sprite {
  static EVENT_ATTACK: string = 'attack';
  placed: boolean;
  attackRange: number;
  attackTimer: TimerEvent;
  mapPosition: Vector2Like;

  constructor(scene: Scene, x: number, y: number, sprite) {
    super(scene, x, y, sprite);

    this.placed = false;
    this.attackRange = 0;
  }

  place(x: number, y: number) {
    this.depth = this.y + (this.height * this.originY);

    this.placed = true;
    this.mapPosition = {x, y};
    this.disableInteractive();
  }

  trigger(hero: Hero) {
  }

  isHeroInRange(hero: Hero) {
    if (Math.abs(hero.mapPosition.x - this.mapPosition.x) < this.attackRange &&
      Math.abs(hero.mapPosition.y - this.mapPosition.y) < this.attackRange) {

      this.trigger(hero);
    }
  }
}
