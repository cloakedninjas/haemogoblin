import Scene = Phaser.Scene;
import {Structure} from './structure';
import {Hero} from './hero';
import Sprite = Phaser.GameObjects.Sprite;

export class Tower extends Structure {
  static ATTACK_DELAY: number = 2000;

  placed: boolean;
  web: Sprite;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'tower');

    this.attackRange = 2;
    this.web = new Sprite(scene, x, y, 'spider-web');
    this.web.setVisible(false);
    scene.add.existing(this.web);
  }

  trigger(hero: Hero) {
    let angle = Phaser.Math.Angle.Between(this.x, this.y, hero.x, hero.y);

    angle = (angle + Math.PI/2) * Phaser.Math.RAD_TO_DEG;

    if (angle < -67.5 || angle >= 247.5) {
      // W
      this.setFrame(4);
      this.flipX = true;
    } else if (angle < -22.5) {
      // NW
      this.setFrame(0);
      this.flipX = true;
    } else if (angle >= 202.5) {
      // SW
      this.setFrame(2);
      this.flipX = false;
    } else if (angle >= 157.5) {
      // S
      this.setFrame(3);
      this.flipX = false;
    } else if (angle >= 112.5) {
      // SE
      this.setFrame(2);
      this.flipX = true;
    } else if (angle >= 67.5) {
      // E
      this.setFrame(4);
      this.flipX = false;
    } else if (angle >= 22.5) {
      // NE
      this.setFrame(0);
      this.flipX = false;
    } else {
      // N
      this.setFrame(1);
      this.flipX = false;
    }

    if (this.canAttack) {
      this.attack(hero);
      this.canAttack = false;

      this.attackTimer = this.scene.time.addEvent({
        delay: Tower.ATTACK_DELAY, callback: this.refreshAttack, callbackScope: this
      });
    }
  }

  attack(hero: Hero) {
    hero.slow();

    this.web.setPosition(this.x, this.y);
    this.web.setVisible(true);

    this.scene.tweens.add({
      targets: this.web,
      x: hero.x,
      y: hero.y,
      ease: 'Quad.easeIn',
      duration: 200,
      onComplete: () => {
        this.web.setVisible(false);
      }
    });
  }
}
