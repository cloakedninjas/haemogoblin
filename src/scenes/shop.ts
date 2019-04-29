import {Scene} from 'phaser';
import {Game} from "../game";
import {Bar} from "../lib/bar";
import {Dungeon} from "./dungeon";

export class Shop extends Scene {
  static STAGE_FIRST: number = 1;
  static STAGE_SELL: number = 2;
  static STAGE_PUMP: number = 3;

  static COIN_START_Y: number = 575;
  static GOLD_WIN: number = 600;
  static POTION_COST: number = 50;
  static START_POTIONS: number = 7;
  static BLOOD_PUMP_AMOUNT: number = 10;

  stage: number;
  bg: Phaser.GameObjects.Image;
  shopKeeper: Phaser.GameObjects.Image;
  coinStack: Phaser.GameObjects.Image;
  bloodPump: Phaser.GameObjects.Sprite;
  gold: number;
  blood: number;
  potionsAvailable: number;
  potions: Phaser.GameObjects.Image[];
  bloodMeter: Bar;
  customer: Phaser.GameObjects.Sprite;

  constructor() {
    super({
      key: 'ShopScene',
    });
  }

  init(data) {
    this.stage = data.stage;

    if (this.stage === Shop.STAGE_FIRST) {
      this.gold = 100;
      this.potionsAvailable = Shop.START_POTIONS;
    } else if (this.stage === Shop.STAGE_PUMP) {
      this.blood = 30;
    } else if (this.stage === Shop.STAGE_SELL) {
      this.potionsAvailable = data.potionsAvailable;
    }
  }

  create() {
    this.bg = this.add.image(0, 0, 'shop-bg');
    this.bg.setOrigin(0);

    const text = this.add.text(1025, 354, Shop.POTION_COST + ' Gold', {
      fontFamily: Game.DEFAULT_FONT,
      fontSize: '50px',
      align: 'center',
      fill: '#000'
    });

    text.setOrigin(0.5, 0);

    this.potions = [];

    if (this.stage === Shop.STAGE_PUMP) {
      this.shopKeeper = this.add.image(this.cameras.main.centerX, this.cameras.main.height, 'blood-shop-keeper');
      this.shopKeeper.setOrigin(0.5, 1);
      this.shopKeeper.depth = 2;

      this.bloodMeter = new Bar(this, {
        fillPercent: this.blood / Dungeon.PLAYER_MAX_HEALTH,
        fillColour: 0x5f080e,
        width: 80,
        height: 24
      });
      this.bloodMeter.x = 322;
      this.bloodMeter.y = 450;
      this.bloodMeter.depth = 2;
      this.add.existing(this.bloodMeter);

      this.bloodPump = this.add.sprite(345, 360, 'blood-pump');
      this.bloodPump.setOrigin(0.5, 0.5);
      this.bloodPump.depth = 3;
      this.bloodPump.setInteractive();

      this.bloodPump.on('animationcomplete', this.onBloodPump, this);

      this.bloodPump.on('pointerdown', () => {
        if (this.blood > Shop.BLOOD_PUMP_AMOUNT) {
          this.bloodPump.anims.play('blood-pump', true);
        }
      });

    } else {
      for (let i = 0; i < this.potionsAvailable; i++) {
        this.addPotion(true);
      }

      this.shopKeeper = this.add.image(this.cameras.main.centerX, this.cameras.main.height, 'shop-keeper');
      this.shopKeeper.setOrigin(0.5, 1);

      this.coinStack = this.add.image(515, Shop.COIN_START_Y, 'coins');
      this.coinStack.setOrigin(0.5, 1);

      const coinjar = this.add.image(515, 512, 'coinjar');
      coinjar.setOrigin(0.5, 1);

      this.setCoinJarMask();

      if (this.stage !== Shop.STAGE_FIRST) {
        this.time.addEvent({
          delay: 1000, callback: this.createCustomer, callbackScope: this
        });
      }
    }
  }

  setCoinJarMask() {
    const fillAmount = this.gold / Shop.GOLD_WIN;
    const fillSize = this.coinStack.height * fillAmount;
    const yOffset = Shop.COIN_START_Y - fillSize;

    this.coinStack.y = yOffset + 10;
    this.coinStack.setCrop(0, 0, this.coinStack.width, fillSize);
  }

  setGold(gold: number) {
    this.gold = gold;
    this.setCoinJarMask();
  }

  addPotion(silent?: boolean) {
    const x = ((this.potions.length % 5) * 120) + 210;
    const y = this.potions.length >= 5 ? 290 : 120;

    const potion = this.add.image(x, y, 'potion');
    potion.depth = 1;
    this.potions.push(potion);
  }

  buyPotion() {
    const potion = this.potions.pop();
    potion.destroy();

    if (this.potions.length === 0) {

      this.time.addEvent({
        delay: 800,
        callback: this.customerWalk,
        callbackScope: this
      });

      //this.customerWalk(false);
    }
  }

  createCustomer() {
    this.customer = this.add.sprite(-300, 1100, 'customer');
    this.customer.setOrigin(0.5, 1);
    this.customer.depth = 4;
    this.customer.angle = -4;
    this.customer.setScale(0.8);

    this.customerWalk(true);
  }

  customerWalk(walkIn?: boolean) {
    const walkDuration = 2000;
    const steps = 6;
    const stepDuration = walkDuration / steps;
    const angle = 4;

    if (walkIn) {
      this.tweens.add({
        targets: this.customer,
        x: 250,
        y: 900,
        duration: walkDuration
      });

      // setup potion purchase
      this.time.addEvent({
        delay: walkDuration + 1000,
        callback: () => {
          this.buyPotion();

          this.time.addEvent({
            delay: 500,
            repeat: this.potions.length - 1,
            callback: this.buyPotion,
            callbackScope: this
          });
        },
      });
    } else {
      this.customer.flipX = true;
      this.tweens.add({
        targets: this.customer,
        x: -300,
        y: 1100,
        duration: walkDuration
      });

      // setup scene end
      this.time.addEvent({
        delay: walkDuration + 1000,
        callback: () => {
          console.log(' endscene');
        },
      });
    }

    this.tweens.add({
      targets: this.customer,
      angle: angle,
      ease: 'Sine.easeOut',
      duration: (stepDuration),
      yoyo: true,
      repeat: (steps / 2) - 1,
      onComplete: () => {
        this.tweens.add({
          targets: this.customer,
          angle: 0,
          ease: 'Quad.easeOut',
          duration: stepDuration
        });
      }
    });


  }

  onBloodPump() {
    this.addPotion();
    this.bloodPump.setFrame(0);
    this.blood -= Shop.BLOOD_PUMP_AMOUNT;
    this.bloodMeter.setValue(this.blood / Dungeon.PLAYER_MAX_HEALTH);
  }

}
