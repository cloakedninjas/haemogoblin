import {Scene} from 'phaser';
import {Hero} from '../entities/hero';
import Pointer = Phaser.Input.Pointer;
import GameObject = Phaser.GameObjects.GameObject;
import Sprite = Phaser.GameObjects.Sprite;
import {Trap} from '../entities/trap';
import {Tower} from '../entities/tower';
import {Structure} from '../entities/structure';
import Graphics = Phaser.GameObjects.Graphics;
import {Bar} from '../lib/bar';
import Text = Phaser.GameObjects.Text;
import {Game} from '../game';
import {Shop} from './shop';

export class Dungeon extends Scene {
  static GRID_SIZE: number = 90;
  static GRID_OFFSET_X: number = 145;
  static GRID_OFFSET_Y: number = 35;
  static MAP_WIDTH: number = 11;
  static MAP_HEIGHT: number = 6;

  static TRAP_PLACEABLE: number = 0;
  static TOWER_PLACEABLE: number = 1;
  static NOT_PLACEABLE: number = 2;

  static BLOOD_COLLECT_RATIO: number = 0.2;

  static COST_TRAP: number = 50;
  static COST_TOWER: number = 60;

  static PLAYER_MAX_HEALTH: number = 100;

  game: Game;
  map: number[][];
  mapBg: Phaser.GameObjects.Image;
  heroPath: Phaser.Curves.Path;
  heroes: Hero[];
  heroesRemaining: number;
  structures: Structure[][];
  newStructure: Structure;
  trapButton: Sprite;
  towerButton: Sprite;
  filledBloodBottle: Sprite;
  filledBottleMask: Graphics;
  gold: number;
  bloodCollected: number;
  playerHealth: number;
  healthBar: Bar;
  goldCounter: Text;

  constructor() {
    super({
      key: 'DungeonScene',
    });

    this.map = [
      [1, 1, 1, 1, 1, 2],
      [1, 0, 0, 0, 1, 0],
      [1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 0, 0],
      [1, 0, 1, 1, 1, 0],
      [2, 0, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
    ];
  }

  init(data) {
    this.playerHealth = data.playerHealth;
    this.gold = data.gold;
  }

  create() {
    this.mapBg = this.add.image(0, 0, 'map');
    this.mapBg.setOrigin(0, 0);

    // define hero path

    this.heroPath = this.add.path(0, 0);

    const coords = [
      [855, -45],
      [855, 135],
      [135, 135],
      [135, 315],
      [675, 315],
      [675, 495],
      [45, 495],
    ];

    coords.forEach((coord, index) => {
      const next = coords[index + 1];

      if (next) {
        const line = new Phaser.Curves.Line([
          coord[0] + Dungeon.GRID_OFFSET_X,
          coord[1] + Dungeon.GRID_OFFSET_Y,
          next[0] + Dungeon.GRID_OFFSET_X,
          next[1] + Dungeon.GRID_OFFSET_Y]);
        this.heroPath.add(line);
      }
    });

    this.heroes = [];
    this.structures = [];

    this.map.forEach(() => {
      this.structures.push(new Array(Dungeon.MAP_WIDTH));
    });

    this.bloodCollected = 0;

    this.mapBg.setInteractive();

    this.input.on('gameobjectdown', this.onObjectDown.bind(this));

    // ui

    const uiPanel = this.add.image(450, this.cameras.main.height, 'ui-bar');
    uiPanel.setOrigin(0, 1);

    const emptyBottle = this.add.image(306, this.cameras.main.height, 'empty-glassbottle');
    emptyBottle.setOrigin(0, 1);

    this.filledBloodBottle = this.add.sprite(306, this.cameras.main.height, 'full-glassbottle');
    this.filledBloodBottle.setOrigin(0, 1);

    this.filledBottleMask = this.make.graphics(undefined);

    this.filledBottleMask.fillStyle(0xffffff);
    this.filledBottleMask.beginPath();

    this.filledBloodBottle.setMask(this.filledBottleMask.createGeometryMask());

    this.healthBar = new Bar(this, {
      fillPercent: this.playerHealth / Dungeon.PLAYER_MAX_HEALTH,
      fillColour: 0xff0000,
      width: 150,
      height: 20
    });
    this.healthBar.x = 10;
    this.healthBar.y = 10;

    this.add.existing(this.healthBar);

    this.goldCounter = this.add.text(906, 683, this.gold.toString(), {
      fontFamily: Game.DEFAULT_FONT,
      fontSize: '30px',
      align: 'center',
      fill: '#000'
    });

    this.goldCounter.setOrigin(0.5);

    // price labels

    this.add.text(520, 670, Dungeon.COST_TRAP.toString(), {
      fontFamily: Game.DEFAULT_FONT,
      fontSize: '20px',
      fill: '#000'
    });

    this.add.text(750, 670, Dungeon.COST_TOWER.toString(), {
      fontFamily: Game.DEFAULT_FONT,
      fontSize: '20px',
      fill: '#000'
    });

    // buttons

    this.trapButton = this.add.sprite(600, 674, 'spike-trap', 3);
    this.trapButton.setInteractive();

    this.trapButton.on('pointerover', () => {
      this.trapButton.setTint(0x00ff00);
    });

    this.trapButton.on('pointerout', () => {
      this.trapButton.clearTint();
    });

    this.towerButton = this.add.sprite(698, 674, 'tower', 1);
    this.towerButton.setInteractive();

    this.towerButton.on('pointerover', () => {
      this.towerButton.setTint(0x00ff00);
    });

    this.towerButton.on('pointerout', () => {
      this.towerButton.clearTint();
    });

    this.input.on('gameobjectup', this.onObjectUp.bind(this));

    this.heroesRemaining = 1;

    this.spawnHero();

    // TODO create spawn system

    //setTimeout(this.spawnHero.bind(this), 3000);

    this.game.playMusic('dungeon');
  }

  update(time, delta) {
    // check for win condition
    if (this.heroes.length === 0 && this.heroesRemaining === 0) {
      // TODO win banner
      console.log(this.bloodCollected, this.playerHealth);
      this.scene.start('ShopScene', {
        stage: Shop.STAGE_PUMP,
        gold: this.gold,
        blood: this.bloodCollected + this.playerHealth
      });
    }
    this.heroes.forEach((hero) => {
      const {x, y} = this.pixelToTile(hero.x, hero.y);

      hero.update(time, delta, x, y);

      // check if any structures are in range
      this.structures.forEach((row) => {
        row.forEach((structure) => {
          structure.isHeroInRange(hero);
        });
      });
    });

    if (this.newStructure) {
      this.newStructure.setPosition(this.input.activePointer.x, this.input.activePointer.y);

      const {x, y} = this.pixelToTile(this.input.activePointer.x, this.input.activePointer.y);

      this.newStructure.canPlace = (this.newStructure instanceof Trap && this.map[x][y] === Dungeon.TRAP_PLACEABLE) ||
        (this.newStructure instanceof Tower && this.map[x][y] === Dungeon.TOWER_PLACEABLE);

      if (this.newStructure.canPlace) {
        this.newStructure.setTint(0x00ff00);
      } else {
        this.newStructure.setTint(0xff0000);
      }
    }
  }

  onObjectDown(pointer: Pointer, gameObject: GameObject) {
    if (gameObject === this.trapButton) {
      this.createTrap();
    } else if (gameObject === this.towerButton) {
      this.createTower();
    }
  }

  onObjectUp(pointer: Pointer) {
    if (this.newStructure) {
      const {x, y} = this.pixelToTile(pointer.x, pointer.y);

      if (this.newStructure.canPlace) {
        this.placeStructure(x, y);
      } else {
        this.newStructure.destroy();
      }

      this.newStructure = null;
    }
  }

  spawnHero() {
    const hero = new Hero(this, this.heroPath.startPoint.x, this.heroPath.startPoint.y, this.heroPath);

    hero.on(Phaser.GameObjects.Events.DESTROY, this.onHeroDestroy.bind(this, hero));
    hero.on(Hero.EVENT_ATTACK, this.onHeroAttack, this);
    hero.startOnPath();

    this.heroes.push(hero);
    this.add.existing(hero);

    this.heroesRemaining--;
  }

  createTrap() {
    if (this.gold >= Dungeon.COST_TRAP) {
      this.newStructure = new Trap(this, 0, 0);
      this.add.existing(this.newStructure);
    }
  }

  createTower() {
    if (this.gold >= Dungeon.COST_TOWER) {
      this.newStructure = new Tower(this, 0, 0);
      this.add.existing(this.newStructure);
    }
  }

  placeStructure(x, y) {
    const halfGrid = Dungeon.GRID_SIZE / 2;
    this.newStructure.setPosition(
      x * Dungeon.GRID_SIZE + halfGrid + Dungeon.GRID_OFFSET_X,
      y * Dungeon.GRID_SIZE + halfGrid + Dungeon.GRID_OFFSET_Y);

    this.newStructure.clearTint();
    this.newStructure.place(x, y);
    this.newStructure.on(Structure.EVENT_ATTACK, this.onStructureAttack, this);
    this.structures[x][y] = this.newStructure;

    if (this.newStructure instanceof Trap) {
      this.gold -= Dungeon.COST_TRAP;
    } else {
      this.gold -= Dungeon.COST_TOWER;
    }

    this.goldCounter.setText(this.gold.toString());
  }

  collectBlood(damage: number) {
    const bloodQty = damage * Dungeon.BLOOD_COLLECT_RATIO;
    const bottle = this.filledBloodBottle;

    console.log(bloodQty);

    this.bloodCollected += bloodQty;

    const fillAmount = this.bloodCollected / 100;
    const maskHeight = bottle.height * fillAmount;
    const y = bottle.y - maskHeight;

    this.filledBottleMask.fillRect(bottle.x, y, bottle.width, maskHeight);
  }

  onStructureAttack(data) {
    const structure: Structure = data.structure;

    if (structure instanceof Trap) {
      this.heroes.forEach((hero) => {
        if (hero.mapPosition.x === structure.mapPosition.x && hero.mapPosition.y === structure.mapPosition.y) {
          const dmgDealt = hero.damage(data.damage);
          this.collectBlood(dmgDealt);
        }
      });
    }
  }

  onHeroDestroy(hero: Hero) {
    const index = this.heroes.indexOf(hero);
    this.heroes.splice(index, 1);
  }

  onHeroAttack(data) {
    this.playerHealth -= data.damage;
    this.healthBar.setValue(this.playerHealth / Dungeon.PLAYER_MAX_HEALTH);

    if (this.playerHealth <= 0) {
      console.log('game over!');
      this.scene.stop();
    }
  }

  pixelToTile(x: number, y: number) {
    const mapX = x - Dungeon.GRID_OFFSET_X;
    const mapY = y - Dungeon.GRID_OFFSET_Y;

    return {
      x: Math.floor(mapX / Dungeon.GRID_SIZE),
      y: Math.floor(mapY / Dungeon.GRID_SIZE)
    }
  }
}
