import 'phaser';
import BaseSound = Phaser.Sound.BaseSound;

export class Game extends Phaser.Game {
  static DEFAULT_FONT = 'Pangolin, cursive, sans-serif';

  tracks: object;
  currentTrack: BaseSound;

  initMusic() {
    this.tracks = {
      shop: this.sound.add('music-shop'),
      dungeon: this.sound.add('music-dungeon'),
      victory: this.sound.add('music-victory')
    }
  }

  playMusic(track) {
    if (this.currentTrack === this.tracks[track]) {
      // already playing it
      return;
    }

    this.stopMusic();

    this.currentTrack = this.tracks[track];
    this.currentTrack.play();
  }

  stopMusic() {
    if (this.currentTrack && this.currentTrack.isPlaying) {
      this.currentTrack.stop();
    }
  }
}
