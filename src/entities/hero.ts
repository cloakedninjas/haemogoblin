import {GameObjects, Scene} from 'phaser';
import Path = Phaser.Curves.Path;
import TimerEvent = Phaser.Time.TimerEvent;

export class Hero extends GameObjects.Sprite {
  static MOVE_SPEED: number = 0.4;
  static MOVE_SPEED_SLOW: number = 0.2;
  static STAMINA_DRAIN: number = 0.05;

  static ACTION_WALKING: number = 1;
  static ACTION_ATTACKING: number = 2;
  static ACTION_LEAVING: number = 3;

  path: Path;
  follower: any;
  health: number;
  stamina: number;
  mapPosition: Vector2Like;
  slowed: boolean;
  slowTimer: TimerEvent;
  action: number;

  constructor(scene: Scene, x: number, y: number, path: Path) {
    super(scene, x, y, 'hero-down-walk');

    this.anims.play('hero-down-walk');

    this.setOrigin(0.5, 0.75);
    this.follower = {t: 0, vec: new Phaser.Math.Vector2()};
    this.path = path;
    this.health = 100;
    this.stamina = 100;
    this.slowed = false;
    this.action = Hero.ACTION_WALKING;
    this.mapPosition = {
      x: 0,
      y: 0
    };

    this.slowTimer = this.scene.time.addEvent({
      delay: 3000, callback: this.removeSlow, callbackScope: this, paused: true, loop: true
    });
  }

  startOnPath() {
    this.follower.t = 0;

    // get x and y of the given t point
    this.path.getPoint(this.follower.t, this.follower.vec);

    // set the x and y of our enemy to the received from the previous step
    this.setPosition(this.follower.vec.x, this.follower.vec.y);
  }

  update(time, delta, x, y) {
    switch (this.action) {
      case Hero.ACTION_WALKING:
        let walkSpeed;

        this.mapPosition.x = x;
        this.mapPosition.y = y;

        if (this.slowed) {
          walkSpeed = (Hero.MOVE_SPEED_SLOW / 10000) * delta;
        } else {
          walkSpeed = (Hero.MOVE_SPEED / 10000) * delta;
        }

        if (this.stamina > 0) {
          this.stamina -= Hero.STAMINA_DRAIN;

          this.follower.t += walkSpeed;

          // set the new x and y coordinates in vec
          this.path.getPoint(this.follower.t, this.follower.vec);

          // update enemy x and y to the newly obtained x and y
          this.setPosition(this.follower.vec.x, this.follower.vec.y);
          this.depth = this.y + (this.height * this.originY);

          // we have reached the end of the path
          if (this.follower.t >= 1) {
            this.action = Hero.ACTION_ATTACKING;
          } else {
            let nextPoint = this.path.getPoint(this.follower.t + walkSpeed);

            if (nextPoint) {
              if (nextPoint.x > this.x) {
                if (this.anims.currentAnim.key !== 'hero-side-walk') {
                  this.flipX = true;
                  this.anims.play('hero-side-walk');
                }
              } else if (nextPoint.x < this.x) {
                if (this.anims.currentAnim.key !== 'hero-side-walk') {
                  this.flipX = false;
                  this.anims.play('hero-side-walk');
                }
              } else {
                if (this.anims.currentAnim.key !== 'hero-down-walk') {
                  this.flipX = false;
                  this.anims.play('hero-down-walk');
                }
              }
            }
          }
        } else {
          this.action = Hero.ACTION_LEAVING;
        }
        break;

      case Hero.ACTION_ATTACKING:
        // TODO - play attac animation, drain stamina
        break;

      case Hero.ACTION_LEAVING:
        if (this.anims.currentAnim.key !== 'hero-teleport') {
          let anim = this.anims.play('hero-teleport');

          this.on('animationcomplete', () => {
            this.setTintFill(0xfbb040, 0xfbb040, 0xffffff, 0xffffff);

            this.scene.tweens.add({
              targets: this,
              alphaBottomLeft: 0,
              alphaBottomRight: 0,
              ease: 'Quad.easeIn',
              duration: 500
            });

            this.scene.tweens.add({
              targets: this,
              alphaTopLeft: 0,
              alphaTopRight: 0,
              ease: 'Quad.easeIn',
              duration: 500,
              delay: 500,
              onComplete: this.onTeleport.bind(this),
            });
          }, this);
        }

        break;
    }
  }

  damage(dmg: number) {
    this.health -= dmg;

    console.log('ouchies', this.health);

    if (this.health <= 0) {
      console.log('he dead...');
      this.destroy();
      return false;
    }

    return true;
  }

  slow() {
    this.slowed = true;
    this.slowTimer.paused = false;
  }

  removeSlow() {
    this.slowed = false;
  }

  onTeleport() {
    this.destroy();
  }
}
