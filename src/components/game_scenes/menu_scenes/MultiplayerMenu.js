import Phaser from "phaser";

export default class MultiplayerMenu extends Phaser.Scene {
  constructor() {
    super("multiplayerMenu");
  }

  init(data) {

    this.menuBg = data.menuBg;
    this.smallPlayButton = data.smPlBtn;
  }


  makeActVis(gameObject, scene) {
    gameObject.scene = scene;
    gameObject.active = true;
    gameObject.visible = true;
  }

  create() {

    this.makeActVis(this.menuBg, this);
    this.makeActVis(this.smallPlayButton, this);
    
    this.add.existing(this.menuBg);
    this.add.existing(this.smallPlayButton);
    
    this.add.text(this.game.renderer.width / 2.65, this.game.renderer.height * 0.27, "Waiting for another player").scale = 0.8;

    const cancelButton = this.add.image(this.game.renderer.width / 2.45, this.game.renderer.height * 0.34, "cancelButton");
    cancelButton.scale = 0.45;

    // const headButton = this.add.image(this.game.renderer.width / 2.1, this.game.renderer.height * 0.37, "headButton");
    // headButton.scale = 0.09;

    cancelButton.setInteractive();
    //headButton.setInteractive();
    this.smallPlayButton.setInteractive();

    // console.log(cancelButton, "cancel");
    cancelButton.on("pointerdown", () => {
      console.log("Show Code");
    });

    // headButton.on("pointerdown", () => {
    //   console.log("Enter Code");
    // });
    
    const backButtonRope = this.add.image(this.game.renderer.width / 2.68, this.game.renderer.height * 0.48, "backButtonRope");
    backButtonRope.scale = 0.45
    this.smallPlayButton.on("pointerdown", () => {
      this.scene.start("playMenu", { menuBg: this.menuBg, smPlBtn: this.smallPlayButton})
    });
  }
}