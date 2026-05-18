import { Room } from "colyseus";
import { MazeDataBase } from "../shared/Mazegen.js";

export class GameRoom extends Room {
  onCreate(options) {
    this.RoomID = this.roomId; // here the room id is created by colisius
    this.Players = new Map();
    this.Spectators = new Map();
    this.MaxPlayers = options.maxPlayers || 4;
    this.GameState = "waiting";
    this.Ticks = 0;
    this.World = new MazeDataBase([], 15, 15, 1, 2);
    this.World.generateMaze();
    this.World.generateMaze();
    this.World.generateMaze();

    this.onMessage("ready", (client) => {
      this.startGame();
    });

    this.setSimulationInterval((dt) => this.update(dt), 1000 / 20);
  }
  //On join of the server is assigns him as a client
  onJoin(client, options) {
    this.addPlayer(client, options);
  }

  onLeave(client) {
    this.removePlayer(client.sessionId);
  }

  addPlayer(client, options) {
    this.Players.set(client.sessionId, {
      id: client.sessionId,
      name: options.name || "Anon",
      x: 0,
      globalY: 0,
      isAlive: true,
    });
  }

  removePlayer(playerID) {
    this.Players.delete(playerID);
  }

  startGame() {
    if (this.Players.size >= this.MaxPlayers) {
      this.GameState = "playing";
      const startAt = Date.now() + 3000;
      this.broadcast("game_start", { startAt });
    }
  }

  update(dt) {
    if (this.GameState !== "playing") return;
    this.Ticks++;
    // тут позже добавишь ScrollOffset и логику смерти
  }
}
