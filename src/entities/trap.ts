import Scene = Phaser.Scene;
import {Structure} from "./structure";
import TimerEvent = Phaser.Time.TimerEvent;

export class Trap extends Structure {
  static DAMAGE: number = 11;

  triggered: boolean;
  placed: boolean;
  shootTimer: TimerEvent;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'spike');
  }

  place(x, y) {
    super.place(x, y);
    this.triggered = false;
  }

  trigger() {
    const config = {
      delay: 500, callback: this.attack, callbackScope: this, repeat: 2
    };

    if (!this.shootTimer) {
      this.attack();
      this.shootTimer = this.scene.time.addEvent(config);
    } else {
      this.shootTimer.repeatCount = 2;
    }
  }

  reset() {
    console.log('stopped attacking');
    this.shootTimer.destroy();
    this.shootTimer = null;
  }

  attack() {
    console.log('Pow!');
    this.emit(Structure.EVENT_ATTACK, {
      structure: this,
      damage: Trap.DAMAGE
    });
  }
}
