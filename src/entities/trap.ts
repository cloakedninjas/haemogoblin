import Scene = Phaser.Scene;
import {Structure} from "./structure";
import TimerEvent = Phaser.Time.TimerEvent;
import {Hero} from "./hero";

export class Trap extends Structure {
  static DAMAGE: number = 11;

  triggered: boolean;
  placed: boolean;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'spike');
    this.attackRange = 1;
  }

  place(x, y) {
    super.place(x, y);
    this.triggered = false;
  }

  trigger() {
    if (!this.attackTimer) {
      this.attack();
      this.attackTimer = this.scene.time.addEvent({
        delay: 500, callback: this.attack, callbackScope: this, repeat: 2
      });
    } else {
      this.attackTimer.repeatCount = 2;
    }
  }

  reset() {
    console.log('stopped attacking');
    this.attackTimer.destroy();
    this.attackTimer = null;
  }

  attack() {
    console.log('Pow!');
    this.emit(Structure.EVENT_ATTACK, {
      structure: this,
      damage: Trap.DAMAGE
    });
  }
}
