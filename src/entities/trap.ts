import Scene = Phaser.Scene;
import {Structure} from './structure';

export class Trap extends Structure {
  static DAMAGE: number = 15;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'spike-trap');
    this.attackRange = 1;
  }

  trigger() {
    if (this.canAttack) {
      this.attack();
      this.canAttack = false;


      this.attackTimer = this.scene.time.addEvent({
        delay: 1000, callback: this.refreshAttack, callbackScope: this
      });
    }
  }

  attack() {
    this.anims.play('spike-trap');
    this.emit(Structure.EVENT_ATTACK, {
      structure: this,
      damage: Trap.DAMAGE
    });
  }

  refreshAttack() {
    super.refreshAttack();

    //debugger;
    //this.anims.stopOnFrame(null);
  }
}
