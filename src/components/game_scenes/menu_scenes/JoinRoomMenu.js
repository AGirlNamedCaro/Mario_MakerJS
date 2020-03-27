import Phaser from "phaser";

export default class Customize extends Phaser.Scene {
  constructor() {
    super("joinRoomMenu");
  }

  init(data) {
    this.key = data.key;
    this.roomId = "";
  }

  create() {
    const backButtonRope = this.add.image(
      this.game.renderer.width / 2.8,
      this.game.renderer.height * 0.47,
      "backButtonRope"
    );
    backButtonRope.scale = 0.45;
    const backButtonRope1 = this.add.image(
      this.game.renderer.width / 1.5,
      this.game.renderer.height * 0.47,
      "backButtonRope"
    );
    backButtonRope1.scale = 0.45;
    const joinRoomMenu = this.add.image(
      this.game.renderer.width / 1.8,
      this.game.renderer.height * 0.34,
      "joinRoomMenu"
    );
    joinRoomMenu.scale = 0.5;
    const joinCreateButton = this.add.image(
      this.game.renderer.width / 1.6,
      this.game.renderer.height * 0.6,
      "joinCreateButton"
    );
    joinCreateButton.scale = 0.15;

    const smallPlayButton = this.add.image(
      this.game.renderer.width / 2.88,
      this.game.renderer.height * 0.62,
      "smallPlayButton"
    );
    smallPlayButton.scale = 0.35;

    smallPlayButton.setInteractive();
    joinCreateButton.setInteractive();

    const inputField = `
        <div id="inputField">
            <input type="text" name="roomName" placeholder="Enter Room Name" />
        </div>`;
    //
    const htmlForm = this.add
      .dom(this.game.renderer.width / 2.1, this.game.renderer.height * 0.3)
      .createFromHTML(inputField);

    joinCreateButton.on("pointerdown", () => {
      const userInput = htmlForm.getChildByName("roomName");
      this.roomId = userInput.value;
      console.log(this.roomId);

      this.game.socket.emit("joinRoom", this.roomId);
      this.game.socket.on("roomMap", roomMap => {
        const changeLevel = new Promise((res, rej) => {
          const roomData =
            roomMap === "assets/mapData/shoobyTileset16.json"
              ? "/assets/mapData/shoobyTileset16.json"
              : roomMap;

          this.game.setLevel(roomData);

          if (this.game.level === roomData) {
            res("level Set");
          } else {
            rej(Error("Level not set correctly"));
          }
        });

        changeLevel.then(res => {
          this.scene.stop("joinRoomMenu");
          const titleScene = this.scene.get("titleScene");
          titleScene.scene.transition({
            target: "authScene",
            duration: 1000,
            data: { roomId: this.roomId }
          });
        });
      });
    });

    smallPlayButton.on("pointerdown", () => {
      this.scene.start("roomSelectMenu");
    });
  }
}