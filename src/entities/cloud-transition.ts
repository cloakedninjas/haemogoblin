import {Scene, GameObjects} from 'phaser';

export class CloudTransition {
  scene: Scene;
  topLeftCloud: GameObjects.Image;
  topRightCloud: GameObjects.Image;
  bottomLeftCloud: GameObjects.Image;
  bottomRightCloud: GameObjects.Image;

  bottomOffset: number;
  topOffset: number;

  xPos: any;

  constructor(scene: Scene) {
    this.scene = scene;

    const w = scene.cameras.main.width;

    this.bottomOffset = 364;
    this.topOffset = 389;

    this.xPos = {
      open: {
        bottomLeft: -this.bottomOffset,
        bottomRight: this.bottomOffset + w,
        topLeft: -this.topOffset,
        topRight: this.topOffset + w
      },
      closed: {
        bottomLeft: this.bottomOffset,
        bottomRight: w - this.bottomOffset,
        topLeft: this.topOffset,
        topRight: w - this.topOffset
      }
    };

    this.bottomLeftCloud = scene.add.image(this.xPos.open.bottomLeft, 0, 'cloud-bottom');
    this.bottomRightCloud = scene.add.image(this.xPos.open.bottomRight, 0, 'cloud-bottom');

    this.topLeftCloud = scene.add.image(this.xPos.open.topLeft, 0, 'cloud-top');
    this.topRightCloud = scene.add.image(this.xPos.open.topRight, 0, 'cloud-top');

    this.topRightCloud.flipX = true;
    this.bottomRightCloud.flipX = true;

    this.bottomLeftCloud.setOrigin(0.5, 0);
    this.bottomRightCloud.setOrigin(0.5, 0);
    this.topLeftCloud.setOrigin(0.5, 0);
    this.topRightCloud.setOrigin(0.5, 0);

    this.bottomLeftCloud.depth = 10;
    this.bottomRightCloud.depth = 10;
    this.topLeftCloud.depth = 10;
    this.topRightCloud.depth = 10;
  }

  addSpritesToScene() {

  }

  close(callback?, instant?: boolean) {
    const duration = 1200;
    const overDelay = 200;

    if (instant) {
      this.bottomLeftCloud.x = this.xPos.closed.bottomLeft;
      this.bottomRightCloud.x = this.xPos.closed.bottomRight;
      this.topLeftCloud.x = this.xPos.closed.topLeft;
      this.topRightCloud.x = this.xPos.closed.topRight;
    } else {
      this.scene.tweens.add({
        targets: this.bottomLeftCloud,
        x: this.xPos.closed.bottomLeft,
        ease: 'Cubic.easeOut',
        duration: duration
      });

      this.scene.tweens.add({
        targets: this.bottomRightCloud,
        x: this.xPos.closed.bottomRight,
        ease: 'Cubic.easeOut',
        duration: duration
      });

      this.scene.tweens.add({
        targets: this.topLeftCloud,
        x: this.xPos.closed.topLeft,
        ease: 'Cubic.easeOut',
        duration: duration - overDelay,
        delay: overDelay
      });

      this.scene.tweens.add({
        targets: this.topRightCloud,
        x: this.xPos.closed.topRight,
        ease: 'Cubic.easeOut',
        duration: duration - overDelay,
        delay: overDelay,
        onComplete: callback
      });
    }
  }

  open(callback?, instant?: boolean) {
    const duration = 2000;
    const overDelay = 200;

    if (instant) {
      this.bottomLeftCloud.x = this.xPos.open.bottomLeft;
      this.bottomRightCloud.x = this.xPos.open.bottomRight;
      this.topLeftCloud.x = this.xPos.open.topLeft;
      this.topRightCloud.x = this.xPos.open.topRight;
    } else {
      this.scene.tweens.add({
        targets: this.bottomLeftCloud,
        x: this.xPos.open.bottomLeft,
        ease: 'Cubic.easeOut',
        duration: duration
      });

      this.scene.tweens.add({
        targets: this.bottomRightCloud,
        x: this.xPos.open.bottomRight,
        ease: 'Cubic.easeOut',
        duration: duration
      });

      this.scene.tweens.add({
        targets: this.topLeftCloud,
        x: this.xPos.open.topLeft,
        ease: 'Cubic.easeOut',
        duration: duration - overDelay,
        delay: overDelay
      });

      this.scene.tweens.add({
        targets: this.topRightCloud,
        x: this.xPos.open.topRight,
        ease: 'Cubic.easeOut',
        duration: duration - overDelay,
        delay: overDelay,
        onComplete: callback
      });
    }
  }
}
