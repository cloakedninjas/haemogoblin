import {GameObjects, Scene} from 'phaser';
import Path = Phaser.Curves.Path;

export class Hero extends GameObjects.Sprite {
  static MOVE_SPEED: number = 0.00005;

  path: Path;
  follower: any;
  health: number;
  mapPosition: {
    x: number,
    y: number
  };

  constructor(scene: Scene, x: number, y: number, path: Path) {
    super(scene, x, y, 'hero');

    this.follower = {t: 0, vec: new Phaser.Math.Vector2()};
    this.path = path;
    this.health = 100;
    this.mapPosition = {
      x: 0,
      y: 0
    }
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

    this.follower.t += Hero.MOVE_SPEED * delta;

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
}
