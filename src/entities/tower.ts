import Scene = Phaser.Scene;
import {Structure} from "./structure";
import {Hero} from "./hero";

export class Tower extends Structure {
  placed: boolean;
  canAttack: boolean;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'tower');

    this.attackRange = 2;
    this.refreshAttack();
  }

  trigger(hero: Hero) {
    if (this.canAttack) {
      this.attack(hero);
      this.canAttack = false;

      this.attackTimer = this.scene.time.addEvent({
        delay: 2000, callback: this.refreshAttack, callbackScope: this
      });
    }
  }

  attack(hero: Hero) {
    console.log('Slow...');
    hero.slow();
  }

  refreshAttack() {
    this.canAttack = true;
  }
}
