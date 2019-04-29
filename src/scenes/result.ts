import {Scene} from 'phaser';
import {Game} from '../game';
import {Shop} from "./shop";

export class Result extends Scene {
  game: Game;
  winCondition: boolean;

  constructor() {
    super({
      key: 'ResultScene',
    });
  }

  init(data) {
    this.winCondition = data.winCondition;
  }

  create() {
    let bg;

    if (this.winCondition) {
      bg = this.add.image(0, 0, 'victory');
    } else {
      bg = this.add.image(0, 0, 'defeat');
    }

    bg.setOrigin(0);

    const button = this.add.rectangle(215, 506, 425, 80);
    button.setOrigin(0);
    button.setInteractive();
    button.on('pointerdown', () => {
      this.scene.start('ShopScene', {
        stage: Shop.STAGE_FIRST
      });
    })
  }
}
