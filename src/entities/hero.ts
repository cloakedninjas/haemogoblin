import {GameObjects, Scene} from 'phaser';
import Path = Phaser.Curves.Path;
import TimerEvent = Phaser.Time.TimerEvent;

export class Hero extends GameObjects.Sprite {
  static MOVE_SPEED: number = 0.00005;
  static MOVE_SPEED_SLOW: number = 0.00002;

  path: Path;
  follower: any;
  health: number;
  mapPosition: {
    x: number,
    y: number
  };
  slowed: boolean;
  slowTimer: TimerEvent;

  constructor(scene: Scene, x: number, y: number, path: Path) {
    super(scene, x, y, 'hero');

    this.follower = {t: 0, vec: new Phaser.Math.Vector2()};
    this.path = path;
    this.health = 100;
    this.slowed = false;
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
    this.mapPosition.x = x;
    this.mapPosition.y = y;

    if (this.slowed) {
      this.follower.t += Hero.MOVE_SPEED_SLOW * delta;
    } else {
      this.follower.t += Hero.MOVE_SPEED * delta;
    }

    // get the new x and y coordinates in vec
    this.path.getPoint(this.follower.t, this.follower.vec);

    // update enemy x and y to the newly obtained x and y
    this.setPosition(this.follower.vec.x, this.follower.vec.y);

    // if we have reached the end of the path, remove the enemy
    if (this.follower.t >= 1) {
      this.setActive(false);
      this.setVisible(false);
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
    console.log('removing slow');
    this.slowed = false;
  }
}
