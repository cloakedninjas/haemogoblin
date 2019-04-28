import {Scene} from 'phaser';
import {Hero} from '../entities/hero';
import Pointer = Phaser.Input.Pointer;
import GameObject = Phaser.GameObjects.GameObject;
import Sprite = Phaser.GameObjects.Sprite;
import {Trap} from "../entities/trap";
import {Tower} from "../entities/tower";
import {Structure} from "../entities/structure";

export class Dungeon extends Scene {
  static GRID_SIZE: number = 90;
  static GRID_OFFSET_X: number = 145;
  static GRID_OFFSET_Y: number = 35;
  static MAP_WIDTH: number = 11;
  static MAP_HEIGHT: number = 6;

  static TRAP_PLACEABLE: number = 0;
  static TOWER_PLACEABLE: number = 1;
  static NOT_PLACEABLE: number = 2;

  map: number[][];
  mapBg: Phaser.GameObjects.Image;
  graphics: Phaser.GameObjects.Graphics;
  heroPath: Phaser.Curves.Path;
  heros: Hero[];
  structures: Structure[][];
  newStructure: Structure;
  trapButton: Sprite;
  towerButton: Sprite;
  gold: number;
  blood: number;

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
    this.anims.create({
      key: 'hero-down-walk',
      frames: this.anims.generateFrameNumbers('hero-down-walk', { start: 0, end: 2 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'hero-side-walk',
      frames: this.anims.generateFrameNumbers('hero-side-walk', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'hero-teleport',
      frames: this.anims.generateFrameNumbers('hero-teleport', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: 0
    });

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

    this.heros = [];
    this.structures = [];

    this.map.forEach(() => {
      this.structures.push(new Array(Dungeon.MAP_WIDTH));
    });

    this.blood = 0;

    this.mapBg.setInteractive();

    this.input.on('gameobjectdown', this.onObjectDown.bind(this));

    this.trapButton = this.add.sprite(300, 650, 'spike');
    this.trapButton.setInteractive();

    this.trapButton.on('pointerover', () => {
      this.trapButton.setTint(0x00ff00);
    });

    this.trapButton.on('pointerout', () => {
      this.trapButton.clearTint();
    });

    this.towerButton = this.add.sprite(400, 650, 'tower');
    this.towerButton.setInteractive();

    this.towerButton.on('pointerover', () => {
      this.towerButton.setTint(0x00ff00);
    });

    this.towerButton.on('pointerout', () => {
      this.towerButton.clearTint();
    });

    this.input.on('gameobjectup', this.onObjectUp.bind(this));

    this.spawnHero();

    setTimeout(this.spawnHero.bind(this), 3000);
  }

  update(time, delta) {
    const heroesLeftAlive = [];

    this.heros.forEach((hero) => {
      const {x, y} = this.pixelToTile(hero.x, hero.y);

      hero.update(time, delta, x, y);

      // check if any structures are in range
      this.structures.forEach((row) => {
        row.forEach((structure) => {
          structure.isHeroInRange(hero);
        });
      });

      if (hero.health > 0) {
        heroesLeftAlive.push(hero);
      }
    });

    this.heros = heroesLeftAlive;

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

    this.heros.push(hero);
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

  onStructureAttack(data) {
    const structure: Structure = data.structure;

    if (structure instanceof Trap) {
      this.heros.forEach((hero) => {
        if (hero.mapPosition.x === structure.mapPosition.x && hero.mapPosition.y === structure.mapPosition.y) {
          hero.damage(data.damage);
          this.blood += data.damage;
        }
      });
    }
  }

  onHeroDestroy(hero: Hero) {
    const index = this.heros.indexOf(hero);
    this.heros.splice(index, 1);
  }

  pixelToTile(x: number, y: number) {
    const mapX = x - Dungeon.GRID_OFFSET_X;
    const mapY = y - Dungeon.GRID_OFFSET_Y;

    /*const gridX = Math.floor(mapX / Dungeon.GRID_SIZE);
    const gridY = Math.floor(mapY / Dungeon.GRID_SIZE);*/

    return {
      x: Math.floor(mapX / Dungeon.GRID_SIZE),
      y: Math.floor(mapY / Dungeon.GRID_SIZE)
    }
  }
}
