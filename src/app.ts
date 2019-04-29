import {Shop as ShopScene} from './scenes/shop';
import {Dungeon as DungeonScene} from './scenes/dungeon';
import {Result as ResultScene} from './scenes/result';
import {Preload} from './scenes/preload';
import {Game} from './game';

const config: GameConfig = {
  title: 'LD44',

  scene: [Preload, ShopScene, DungeonScene, ResultScene],
  backgroundColor: '#333',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container',
    width: 1280,
    height: 720,
    max: {
      width: 1280,
      height: 720,
    }
  },
};

window.addEventListener('load', () => {
  window['game'] = new Game(config);
});
