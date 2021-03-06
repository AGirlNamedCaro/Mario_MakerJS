import Phaser from "phaser";
import { createCursors, createWorld, playerAnimations } from "./GameHelpers";

export default class MultiplayerScene extends Phaser.Scene {
  constructor() {
    super("multiplayerScene");
  }

  init(data) {
    this.playerState = this.calcPlayerState();
    this.oldPlayerState = this.playerState;
    this.socket = this.game.socket;
    this.roomId = data.roomId;
    this.score = "";
    this.gameOverScore = "";
    this.level = 0;
  }

  preload() {
    this.load.image("tiles", "/assets/images/prefabs/shoobyTileSet.png");
    this.load.tilemapTiledJSON("multiWorld", this.game.level);
  }

  create() {
    const self = this;
    this.socket.emit("ready", this.roomId);
    createWorld(self, "multiWorld");
    createCursors(self);

    this.players = this.add.group();
    this.fishes = this.add.group();
    this.bombs = this.add.group();

    this.socket.on("currentPlayers", ({ players, gameObjects }) => {
      Object.keys(players).forEach(id => {
        playerAnimations(self, players[id].character);
        console.log("playerData " + id, players[id]);
        if (players[id].playerId === self.socket.id) {
          this.player = this.displayPlayers(
            self,
            players[id],
            players[id].character
          );
        } else {
          this.displayPlayers(self, players[id], players[id].character);
        }
      });

      Object.keys(gameObjects.fish).forEach(fish => {
        this.displayFish(self, gameObjects.fish[fish], fish, "fish");
      });

      Object.keys(gameObjects.bombs).forEach(bomb => {
        this.displayBombs(self, gameObjects.bombs[bomb], bomb, "bomb");
      });
    });

    this.socket.on("newPlayer", playerInfo => {
      console.log("newPlayer");
      console.log("playerData", playerInfo);
      playerAnimations(self, playerInfo.character);
      this.displayPlayers(self, playerInfo, playerInfo.character);
    });

    this.socket.on("bombSpawn", ({ x, length }) => {
      console.log("length", length);
      this.level++;
      this.numOfBombs = length - this.game.bomb;
      console.log("num", this.numOfBombs);
      //TODO Get this from difficulty of the game
      console.log("spawning");
      for (let i = 0; i < this.game.bomb; i++) {
        this.displayBombs(self, x, `bomb${this.numOfBombs}`, "bomb");
        this.numOfBombs++;
        console.log("aftern", this.numOfBombs);
      }
    });

    this.socket.on("disconnect", playerId => {
      self.players.getChildren().forEach(player => {
        if (playerId === player.playerId) {
          player.destroy();
        }
      });
    });

    this.socket.on("gameUpdates", ({ players, gameObjects }) => {
      Object.keys(players).forEach(id => {
        self.players.getChildren().forEach(player => {
          if (id === player.playerId) {
            if (player.x > players[id].x) {
              player.anims.play(players[id].character + "left", true);
            } else if (player.x < players[id].x) {
              player.anims.play(players[id].character + "right", true);
            } else {
              player.anims.play(players[id].character + "turn");
            }
            player.setPosition(players[id].x, players[id].y);
          }
        });
      });

      Object.keys(gameObjects.fish).forEach(fish => {
        self.fishes.getChildren().forEach(fishes => {
          if (fishes.fishId === fish) {
            if (gameObjects.fish[fish].active) {
              fishes.setPosition(
                gameObjects.fish[fish].x,
                gameObjects.fish[fish].y
              );
              fishes.setActive(true);
              fishes.setVisible(true);
            } else {
              fishes.setActive(false);
              fishes.setVisible(false);
            }
          }
        });
      });

      Object.keys(gameObjects.bombs).forEach(bomb => {
        self.bombs.getChildren().forEach(bombs => {
          if (bombs.bombId === bomb) {
            bombs.setPosition(
              gameObjects.bombs[bomb].x,
              gameObjects.bombs[bomb].y
            );
          }
        });
      });

      if (gameObjects.gameOver === true) {
        this.displayGameOver(players);
        this.gameOverText.text = this.gameOverScore;
      }

      this.scoreData(players);
      this.scoreText.text = this.score;
    });

    this.gameOverText = this.add.text(100, 100, this.gameOverScore, {
      fontSize: "32px",
      fill: "#fff"
    });

    this.scoreText = this.add.text(16, 16, this.score, {
      fontSize: "32px",
      fill: "#fff"
    });
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

    // TODO need the player to be a physics object to collide with world bounds, but causes glitches
    // Server might also think its passing the world bounds and giving back an incorrect position
    // player.setCollideWorldBounds(true);
    self.players.add(player);
    return player;
  }

  displayFish(self, fish, fishId, sprite) {
    const newFish = self.add.sprite(fish.x, fish.y, sprite);
    newFish.fishId = fishId;
    newFish.anims.play("flop", true);
    self.fishes.add(newFish);
    return newFish;
  }

  displayBombs(self, bomb, bombId, sprite) {
    const newBomb = self.add.image(bomb.x, bomb.y, sprite);
    newBomb.bombId = bombId;
    self.bombs.add(newBomb);
    return newBomb;
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
        y: this.game.jump
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

  scoreData(players) {
    // TODO set the player number to the playerId
    const firstShoob = Object.keys(players)[0];
    this.score = `Shooby 1: ${players[firstShoob].points}`;
    if (this.socket.id === firstShoob) {
      this.score = this.score.concat(" *");
    }

    for (let i = 1; i < Object.keys(players).length; i++) {
      this.score = this.score.concat(
        `\nShooby ${i + 1}: ${players[Object.keys(players)[i]].points}`
      );

      if (Object.keys(players)[i] === this.socket.id) {
        this.score = this.score.concat(" *");
      }
    }
  }

  displayGameOver(players) {
    // TODO rewrite this so that highscores can be used in scoreData also
    const highScores = {};

    for (let i = 0; i < Object.keys(players).length; i++) {
      if (Object.keys(players)[i] === this.socket.id) {
        highScores[`Shooby ${i + 1}`] = players[Object.keys(players)[i]].points + " *";
      } else {
        highScores[`Shooby ${i + 1}`] = players[Object.keys(players)[i]].points;
      }
    }

    const sortedScore = Object.entries(highScores).sort((a, b) => b[1] - a[1]);

    this.gameOverScore = "GAME OVER \nHIGH SCORES";

    sortedScore.forEach((score, index) => {
      this.gameOverScore = this.gameOverScore.concat(
        `\n\n${index + 1}. ${score[0]} : ${score[1]}`
      );
    });
  }
}
