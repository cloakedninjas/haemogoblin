import {Scene} from 'phaser';
import {Hero} from '../entities/hero';
import Pointer = Phaser.Input.Pointer;
import GameObject = Phaser.GameObjects.GameObject;
import Sprite = Phaser.GameObjects.Sprite;
import {Trap} from "../entities/trap";
import {Tower} from "../entities/tower";
import {Structure} from "../entities/structure";
import Graphics = Phaser.GameObjects.Graphics;

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

  map: number[][];
  mapBg: Phaser.GameObjects.Image;
  graphics: Phaser.GameObjects.Graphics;
  heroPath: Phaser.Curves.Path;
  heroes: Hero[];
  structures: Structure[][];
  newStructure: Structure;
  trapButton: Sprite;
  towerButton: Sprite;
  filledBloodBottle: Sprite;
  filledBottleMask: Graphics;
  gold: number;
  bloodCollected: number;
  playerHealth: number;

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

  init() {
  }

  create() {
    this.mapBg = this.add.image(0, 0, 'map');
    this.mapBg.setOrigin(0, 0);

    // define hero path

    this.graphics = this.add.graphics();
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

    this.spawnHero();

    //setTimeout(this.spawnHero.bind(this), 5000);
  }

  update(time, delta) {
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

    this.graphics.clear();
    this.graphics.lineStyle(2, 0xffff00, 1);

    this.heroPath.draw(this.graphics);

    if (this.newStructure) {
      this.newStructure.setPosition(this.input.activePointer.worldX, this.input.activePointer.worldY);
    }
  }

  onObjectDown(pointer: Pointer, gameObject: GameObject) {
    if (gameObject === this.trapButton) {
      this.createTrap();
    } else if (gameObject === this.towerButton) {
      this.createTower();
    }
  }

  onObjectUp(pointer: Pointer, gameObject: GameObject) {
    if (this.newStructure) {
      const {x, y} = this.pixelToTile(pointer.x, pointer.y);

      const canPlace = (this.newStructure instanceof Trap && this.map[x][y] === Dungeon.TRAP_PLACEABLE) ||
        (this.newStructure instanceof Tower && this.map[x][y] === Dungeon.TOWER_PLACEABLE);

      if (canPlace) {
        const halfGrid = Dungeon.GRID_SIZE / 2;
        this.newStructure.setPosition(
          x * Dungeon.GRID_SIZE + halfGrid + Dungeon.GRID_OFFSET_X,
          y * Dungeon.GRID_SIZE + halfGrid + Dungeon.GRID_OFFSET_Y);
        this.newStructure.place(x, y);
        this.newStructure.on(Structure.EVENT_ATTACK, this.onStructureAttack, this);
        this.structures[x][y] = this.newStructure;

        this.newStructure = null;
      } else {
        this.newStructure.destroy();
        this.newStructure = null;
      }
    }
  }

  spawnHero() {
    const hero = new Hero(this, this.heroPath.startPoint.x, this.heroPath.startPoint.y, this.heroPath);

    hero.on(Phaser.GameObjects.Events.DESTROY, this.onHeroDestroy.bind(this, hero));
    hero.startOnPath();

    this.heroes.push(hero);
    this.add.existing(hero);
  }

  createTrap() {
    this.newStructure = new Trap(this, 0, 0);
    this.add.existing(this.newStructure);
  }

  createTower() {
    this.newStructure = new Tower(this, 0, 0);
    this.add.existing(this.newStructure);
  }

  collectBlood(damage: number) {
    const bloodQty = damage * Dungeon.BLOOD_COLLECT_RATIO;
    const bottle = this.filledBloodBottle;

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
          hero.damage(data.damage);
          this.collectBlood(data.damage);
        }
      });
    }
  }

  onHeroDestroy(hero: Hero) {
    const index = this.heroes.indexOf(hero);
    this.heroes.splice(index, 1);
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
