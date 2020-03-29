import Phaser from "phaser";
import { createCursors, createWorld, playerAnimations } from "./GameHelpers";

export default class MultiplayerScene extends Phaser.Scene {
  constructor() {
    super("multiplayerScene");
  }
  
  init(data) {
    this.playerState = this.calcPlayerState();
    this.oldPlayerState = this.playerState;
    this.bombs = data.bombs;
    this.score = data.score;
    this.fishNum = data.fishNum;
    this.stepX = data.stepX;
    this.socket = this.game.socket;
    this.roomId = data.roomId;
  }

  preload() {
    this.load.image("tiles", "/assets/images/prefabs/shoobyTileSet.png");
    this.load.tilemapTiledJSON("world", this.game.level);
  }

  create() {

    console.log("DATA: ",this.bombs,this.score,this.fishNum,this.stepX);
    const self = this;
    this.socket.emit("ready", this.roomId);

    createWorld(self);

    this.players = this.add.group();
    this.fishes = this.add.group();

    this.socket.on("currentPlayers", ({players, gameObjects}) => {
      Object.keys(players).forEach(id => {
        if (players[id].playerId === self.socket.id) {
          this.player = this.displayPlayers(self, players[id], "dude");
        } else {
          this.displayPlayers(self, players[id], "dude");
        }
      });

      console.log("gameobj", gameObjects)
      Object.keys(gameObjects).forEach(fish => {
        console.log("madeFish", this.displayFish(self, gameObjects[fish], fish, "fish"));
      })
    });

    this.socket.on("newPlayer", playerInfo => {
      console.log("newPlayer")
      this.displayPlayers(self, playerInfo, "dude");
    });

    this.socket.on("disconnect", playerId => {
      self.players.getChildren().forEach(player => {
        if (playerId === player.playerId) {
          player.destroy();
        }
      });
    });

    // TODO clean this up like the current players, deconstruct in the .on
    this.socket.on("gameUpdates", gameUpdates => {
      Object.keys(gameUpdates.players).forEach(id => {
        self.players.getChildren().forEach(player => {
          if (id === player.playerId) {
            if (player.x > gameUpdates.players[id].x) {
              player.anims.play("left", true);
            } else if (player.x < gameUpdates.players[id].x) {
              player.anims.play("right", true);
            } else {
              player.anims.play("turn");
            }
            player.setPosition(gameUpdates.players[id].x, gameUpdates.players[id].y);
          }
        });
      });
    });

    // this.socket.on("objectUpdates", gameObjects => {
    //   console.log("gameObjects", gameObjects);
    // })

    
    createCursors(self);

    playerAnimations(self, this.game.character);
  

  }

  update() {
    if (this.player) {
      if (this.cursors.left.isDown) {
        this.playerState.left = true;
      } else if (this.cursors.right.isDown) {
        this.playerState.right = true;
      } else {
        this.playerState.left = false;
        this.playerState.right = false;
      }

      if (this.cursors.up.isDown) {
        this.playerState.up = true;
      } else {
        this.playerState.up = false;
      }

      if (
        this.playerState.left !== this.oldPlayerState.left ||
        this.playerState.right !== this.oldPlayerState.right ||
        this.playerState.up !== this.oldPlayerState.up
      ) {

        this.playerState.roomId = this.roomId;
        this.socket.emit("playerInput", this.playerState);
      }
      this.oldPlayerState = { ...this.playerState };
    }
  }

  // TODO dry up these functions
  displayPlayers(self, playerInfo, sprite) {
    console.log(playerInfo.x, playerInfo.y);
    const player = self.add.sprite(playerInfo.x, playerInfo.y, sprite);
    player.playerId = playerInfo.playerId;
    self.players.add(player);
    return player;
  }

  displayFish(self, fish, fishId, sprite) {
    const newFish = self.add.sprite(fish.x, fish.y, sprite);
    newFish.fishId = fishId;
    self.fishes.add(newFish);
    return newFish;
  }

  calcPlayerState(player, playerState, isState, state) {
    let resultsObj = {};
    if (!playerState) {
      resultsObj = {
        up: false,
        left: false,
        down: false,
        right: false,
        x: 100,
        y: 450
      };
      return resultsObj;
    }

    resultsObj = playerState;

    if (isState) {
      resultsObj[state] = true;
    } else {
      resultsObj[state] = false;
    }
    resultsObj.x = player.x;
    resultsObj.y = player.y;
    return resultsObj;
  }
}
