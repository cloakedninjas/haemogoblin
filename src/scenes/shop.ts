import {Scene} from 'phaser';

export class Shop extends Scene {
  constructor() {
    super({
      key: 'ShopScene',
    });
  }

  init() {
    console.log('shop init here');
  }

}
