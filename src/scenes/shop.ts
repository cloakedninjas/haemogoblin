import {Scene} from 'phaser';
import {Game} from "../game";

export class Shop extends Scene {
  static COIN_START_Y:number = 575;
  static GOLD_WIN:number = 600;
  static POTION_COST:number = 50;

  firstTime: boolean;
  bg: Phaser.GameObjects.Image;
  shopKeeper: Phaser.GameObjects.Image;
  coinStack: Phaser.GameObjects.Image;
  gold: number;

  constructor() {
    super({
      key: 'ShopScene',
    });
  }

  init(data) {
    if (data.firstTime) {
      this.firstTime = true;
      this.gold = 100;
    }
  }

  create() {
    this.bg = this.add.image(0, 0, 'shop-bg');
    this.bg.setOrigin(0);

    this.shopKeeper = this.add.image(this.cameras.main.centerX, this.cameras.main.height, 'shop-keeper');
    this.shopKeeper.setOrigin(0.5, 1);

    this.coinStack = this.add.image(515, Shop.COIN_START_Y, 'coins');
    this.coinStack.setOrigin(0.5, 1);

    const coinjar = this.add.image(515, 512, 'coinjar');
    coinjar.setOrigin(0.5, 1);

    this.setCoinJarMask();

    const text = this.add.text(1025, 354, Shop.POTION_COST + ' Gold', {
      fontFamily: Game.DEFAULT_FONT,
      fontSize: '50px',
      align: 'center',
      fill: '#000'
    });

    text.setOrigin(0.5, 0);
  }

  setCoinJarMask() {
    const fillAmount = this.gold / Shop.GOLD_WIN;
    const fillSize = this.coinStack.height * fillAmount;
    const yOffset = Shop.COIN_START_Y - fillSize;

    this.coinStack.y = yOffset + 10;

    console.log(fillAmount, fillSize, yOffset);

    this.coinStack.setCrop(0, 0, this.coinStack.width, fillSize);
  }

  setGold(gold: number) {
    this.gold = gold;
    this.setCoinJarMask();
  }

}
