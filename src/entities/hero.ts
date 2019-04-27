import {GameObjects, Scene} from 'phaser';
import Path = Phaser.Curves.Path;

export class Hero extends GameObjects.Sprite {
  static MOVE_SPEED: number = 0.0001;

  path: Path;
  follower: any;

  constructor(scene: Scene, x: number, y: number, path: Path) {
    super(scene, x, y, 'hero');

    this.follower = {t: 0, vec: new Phaser.Math.Vector2()};
    this.path = path;
  }

  startOnPath() {
    this.follower.t = 0;

    // get x and y of the given t point
    this.path.getPoint(this.follower.t, this.follower.vec);

    // set the x and y of our enemy to the received from the previous step
    this.setPosition(this.follower.vec.x, this.follower.vec.y);
  }

  update(time, delta) {
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
}
