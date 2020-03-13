import Phaser from "phaser";

export default class Preload extends Phaser.Scene {
  constructor() {
    super("preloadAssets")
  }

  preload() {
    // this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
    // this.load.image('logo', 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');
    // this.load.image('red', 'https://labs.phaser.io/assets/particles/red.png');
    
    this.load.image('playButton', "/assets/playButton.png");
    this.load.image('smallPlayButton', "/assets/smallPlayButton.png");
    this.load.image('singlePlayer', "/assets/singlePlayerButton.png");
    this.load.image('multiplayer', "/assets/multiplayerButton.png");
    this.load.image("menuBg", "/assets/menu-bg.png");
    this.load.image("cancelButton", "/assets/cancelButton.png");
    this.load.image("headButton", "/assets/headButton.png");

    this.load.on("progress", () => {
      this.add.text(20, 20, "Loading game...")
    })

    this.load.on("complete", () => {
      this.scene.start("TitleScene")
    });
  }
}