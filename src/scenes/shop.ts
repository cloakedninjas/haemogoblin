import {Scene} from 'phaser';
import {Game} from '../game';
import {Bar} from '../lib/bar';
import {Dungeon} from './dungeon';
import {CloudTransition} from "../entities/cloud-transition";

export class Shop extends Scene {
  static STAGE_FIRST: number = 1;
  static STAGE_SELL: number = 2;
  static STAGE_PUMP: number = 3;

  static COIN_START_Y: number = 575;
  static GOLD_START: number = 20;
  static GOLD_WIN: number = 600;
  static POTION_COST: number = 50;
  static START_POTIONS: number = 7;
  static BLOOD_PUMP_AMOUNT: number = 10;

  game: Game;
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
  sounds: Record<string, Phaser.Sound.BaseSound>;
  creditHitArea: Record<string, Phaser.GameObjects.Rectangle>;
  spiderClickCount: number;
  transition: CloudTransition;

  constructor() {
    super({
      key: 'ShopScene',
    });

    this.spiderClickCount = 0;
  }

  init(data) {
    this.stage = data.stage;

    if (this.stage === Shop.STAGE_FIRST) {
      this.gold = 100;
      this.potionsAvailable = Shop.START_POTIONS;
    } else if (this.stage === Shop.STAGE_PUMP) {
      this.blood = data.blood;
      this.gold = data.gold;
    } else if (this.stage === Shop.STAGE_SELL) {
      this.gold = data.gold;
      this.potionsAvailable = data.potionsAvailable;
      this.blood = data.blood;
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
          this.sounds['fill-bottle'].play();
        }
      });

      const button = this.add.image(958, 500, 'open-sign');
      button.setInteractive();
      button.depth = 3;
      button.on('pointerdown', () => {
        // trigger sell scene
        this.scene.start('ShopScene', {
          stage: Shop.STAGE_SELL,
          potionsAvailable: this.potions.length,
          gold: this.gold,
          blood: this.blood
        });
      });

    } else {
      for (let i = 0; i < this.potionsAvailable; i++) {
        this.addPotion();
      }

      this.shopKeeper = this.add.image(this.cameras.main.centerX, this.cameras.main.height, 'shop-keeper');
      this.shopKeeper.setOrigin(0.5, 1);
      this.shopKeeper.depth = 2;

      this.coinStack = this.add.image(515, Shop.COIN_START_Y, 'coins');
      this.coinStack.setOrigin(0.5, 1);
      this.coinStack.setDepth(2);

      const coinjar = this.add.image(515, 512, 'coinjar');
      coinjar.setOrigin(0.5, 1);
      coinjar.setDepth(2);

      this.setCoinJarMask();

      if (this.stage !== Shop.STAGE_FIRST) {
        this.time.addEvent({
          delay: 1000, callback: this.createCustomer, callbackScope: this
        });
      } else {
        const startButton = this.add.image(294, 515, 'play-btn');
        startButton.setOrigin(0.5, 1);
        startButton.setInteractive();
        startButton.setDepth(3);
        startButton.on('pointerdown', () => {
          this.scene.start('ShopScene', {
            stage: Shop.STAGE_SELL,
            gold: Shop.GOLD_START,
            blood: 100,
            potionsAvailable: Shop.START_POTIONS
          });
        });

        this.creditHitArea = {
          'cloakedninjas': this.add.rectangle(321, 653, 249, 50),
          'treslapin': this.add.rectangle(488, 611, 179, 49),
          'thedorkulon': this.add.rectangle(184, 597, 270, 42)
        };

        for (let user in this.creditHitArea) {
          this.creditHitArea[user].setInteractive();
          this.creditHitArea[user].setOrigin(0 ,0);

          this.creditHitArea[user].on('pointerdown', () => {
            window.open('https://twitter.com/' + user);
          });
        }

        const title = this.add.image(160, 15, 'title');
        title.setOrigin(0);
        title.setTint(0x333333);

        /*const startCol = Phaser.Display.Color.IntegerToColor(0x333333);
        const endCol = Phaser.Display.Color.IntegerToColor(0xffffff);

        this.tweens.addCounter({
          from: 0,
          to: 100,
          duration: 2000,
          onUpdate: function (tween, value: number) {
            let col = Phaser.Display.Color.Interpolate.ColorWithColor(startCol, endCol, 100, value);
            let hex = Phaser.Display.Color.GetColor(col.r, col.g, col.b);
            title.setTint(hex);
          },
          //onComplete: callback
        });*/

        /*this.time.addEvent({
          delay: 1000, callback: () => {
            title.clearTint();
          }
        });

        this.time.addEvent({
          delay: 1050, callback: () => {
            title.setTint(0x333333);
          }
        });*/

      }

      const spider = this.add.rectangle(1050, 465, 40, 41);
      spider.setInteractive();
      spider.setOrigin(0 ,0);

      spider.on('pointerdown', () => {
        this.spiderClickCount++;

        if (this.spiderClickCount === 5) {
          this.sound.add('anna-im-a-spider').play();
        } else if (this.spiderClickCount === 10) {
          this.sound.add('anna-i-go-poik').play();
        } else if (this.spiderClickCount > 10 && this.spiderClickCount % 5 === 0) {
          this.sound.add('anna-poik').play();
        }
      });
    }

    this.transition = new CloudTransition(this);

    this.sounds = {
      'fill-bottle': this.sound.add('fill-bottle-short'),
      'door-bell': this.sound.add('door-bell'),
    };

    for (let i = 1; i <= 4; i++) {
      this.sounds['sale-' + i] = this.sound.add('shop-sale-' + i);
    }

    this.game.playMusic('shop');
  }

  setCoinJarMask() {
    const fillAmount = Math.min(this.gold / Shop.GOLD_WIN, 1);
    const fillSize = this.coinStack.height * fillAmount;
    const yOffset = Shop.COIN_START_Y - fillSize;

    this.coinStack.y = yOffset + 10;
    this.coinStack.setCrop(0, 0, this.coinStack.width, fillSize);
  }

  addGold(gold: number) {
    this.gold += gold;
    this.setCoinJarMask();
  }

  addPotion() {
    const x = ((this.potions.length % 5) * 120) + 210;
    const y = this.potions.length >= 5 ? 290 : 120;

    const potion = this.add.image(x, y, 'potion');
    potion.depth = 1;
    this.potions.push(potion);
  }

  buyPotion() {
    const potion = this.potions.pop();

    if (potion) {
      potion.destroy();
      this.addGold(Shop.POTION_COST);

      this.sounds['sale-' + Phaser.Math.Between(1, 4)].play();
    }

    if (this.potions.length === 0) {
      this.time.addEvent({
        delay: 800,
        callback: this.customerWalk,
        callbackScope: this
      });
    } else {
      // buy another

      this.time.addEvent({
        delay: 500,
        callback: this.buyPotion,
        callbackScope: this
      });
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
      this.sounds['door-bell'].play();

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
        },
      });
    } else {
      this.customer.flipX = true;
      this.tweens.add({
        targets: this.customer,
        x: -300,
        y: 1100,
        duration: walkDuration,
        onComplete: () => {
          this.sounds['door-bell'].play();
        }
      });

      // setup scene end
      this.time.addEvent({
        delay: walkDuration + 1000,
        callback: () => {
          // TODO - add gold check for win condition

          this.game.stopMusic();

          this.sound.add('music-transition').play();

          this.transition.close(() => {
            this.scene.start('DungeonScene', {
              playerHealth: this.blood,
              gold: this.gold
            });
          });
        }
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
