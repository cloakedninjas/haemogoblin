import Scene = Phaser.Scene;
import {Structure} from "./structure";

export class Trap extends Structure {
  static DAMAGE: number = 11;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'spike');
    this.attackRange = 1;
  }

  trigger() {
    if (this.canAttack) {
      this.attack();
      this.canAttack = false;

      this.attackTimer = this.scene.time.addEvent({
        delay: 500, callback: this.refreshAttack, callbackScope: this
      });
    }
  }

  attack() {
    this.emit(Structure.EVENT_ATTACK, {
      structure: this,
      damage: Trap.DAMAGE
    });
  }
}
