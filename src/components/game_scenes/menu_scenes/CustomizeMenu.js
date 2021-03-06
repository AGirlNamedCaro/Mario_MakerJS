import Phaser from "phaser";
const axios = require("axios");

export default class Customize extends Phaser.Scene {
  constructor() {
    super("customizeMenu");
  }

  init(data) {
    this.menuBg = data.menuBg;
    this.menuBg.scene = this;
    this.menuBg.active = true;
    this.menuBg.visible = true;
    this.key = data.key;
  }

  create() {
    this.add.existing(this.menuBg);
    this.menuBg.scaleY = 0.3;

    const setMapButton = this.add.image(
      this.game.renderer.width / 2,
      this.game.renderer.height * 0.18,
      "setMapButton"
    );
    setMapButton.scale = 0.27;
    const createMapButton = this.add.image(
      this.game.renderer.width / 1.97,
      this.game.renderer.height * 0.299,
      "createMapButton"
    );
    createMapButton.scale = 0.25;
    const createCharButton = this.add.image(
      this.game.renderer.width / 1.95,
      this.game.renderer.height * 0.43,
      "createCharButton"
    );
    createCharButton.scale = 0.28;
    const backButtonRope = this.add.image(
      this.game.renderer.width / 2.68,
      this.game.renderer.height * 0.48,
      "backButtonRope"
    );
    backButtonRope.scale = 0.45;
    const smallPlayButton = this.add.image(
      this.game.renderer.width / 2.75,
      this.game.renderer.height * 0.63,
      "smallPlayButton"
    );
    smallPlayButton.scale = 0.35;

    smallPlayButton.setInteractive();
    setMapButton.setInteractive();
    createMapButton.setInteractive();
    createCharButton.setInteractive();

    setMapButton.on("pointerdown", () => {
      this.scene.start("setMapMenu", {
        menuBg: this.menuBg,
        setMapButton: setMapButton,
        backButtonRope: backButtonRope,
        backButton: smallPlayButton
      });
    });

    createMapButton.on("pointerdown", () => {
      // TODO can implement this when rewrite the titlescene logic to not use setTimeout
      setTimeout(() => {
        this.scene.stop("titleScene");
      }, 1000);
      this.scene.start("createMap");
    });

    smallPlayButton.on("pointerdown", () => {
      this.scene.start("mainMenu");
    });

    createCharButton.on("pointerdown", () => {
      this.scene.start("createCharacter", {
        menuBg: this.menuBg,
        key: this.key
      });
    });
  }
}
