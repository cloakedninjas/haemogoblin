import Scene = Phaser.Scene;
import {Structure} from "./structure";
import {Hero} from "./hero";
import Sprite = Phaser.GameObjects.Sprite;

export class Tower extends Structure {
  placed: boolean;
  web: Sprite;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'tower');

    this.attackRange = 2;
    this.web = new Sprite(scene, x, y, 'tower');
    //this.web.setVisible(false);
    this.web.tint = 0x334455;
    this.web.setScale(0.3);
    scene.add.existing(this.web);
  }

  trigger(hero: Hero) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, hero.x, hero.y);

    this.angle = (angle + Math.PI/2) * Phaser.Math.RAD_TO_DEG;

    if (this.canAttack) {
      this.attack(hero);
      this.canAttack = false;

      this.attackTimer = this.scene.time.addEvent({
        delay: 2000, callback: this.refreshAttack, callbackScope: this
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
