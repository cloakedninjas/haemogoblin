import Scene = Phaser.Scene;
import {Structure} from './structure';

export class Trap extends Structure {
  static DAMAGE: number = 15;
  static ATTACK_DELAY: number = 800;

  sounds: Phaser.Sound.BaseSound[];

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'spike-trap');
    this.attackRange = 1;
    this.sounds = [
      scene.sound.add('spike-trap-1'),
      scene.sound.add('spike-trap-2'),
    ];
  }

  trigger() {
    if (this.canAttack) {
      this.attack();
      this.canAttack = false;

      this.attackTimer = this.scene.time.addEvent({
        delay: Trap.ATTACK_DELAY, callback: this.refreshAttack, callbackScope: this
      });
    }
  }

  attack() {
    this.sounds[Phaser.Math.Between(0, 1)].play();
    this.anims.play('spike-trap');
    this.emit(Structure.EVENT_ATTACK, {
      structure: this,
      damage: Trap.DAMAGE
    });
  }
}
