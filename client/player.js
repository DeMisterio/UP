import { db, ITEM_DEFS, charSetImages, cellSize } from "./screens/script.js";

export class Player {
  constructor(x, y, PlayerID, ThisIMG, TrailColor, Uname, inventory) {
    this.x = x;
    this.globalY = y;
    this.PlayerID = PlayerID;
    this.ThisIMG = charSetImages[ThisIMG];
    this.img = this.ThisIMG.right;
    this.inventory = inventory ?? [];
    this.TrailColor = TrailColor;
    this.IsAlive = true;
  }

  // globalY растёт ВВЕРХ по башне
  // arrayRow = (mazeSize-1) - (globalY % mazeSize)
  // chunkIndex = Math.floor(globalY / mazeSize)
  getTile(x, globalY) {
    if (globalY < 0) return 1;
    const H = db.HStandart;
    const chunkIndex = Math.floor(globalY / H) - (db.removedChunks ?? 0);
    const arrayRow = H - 1 - (globalY % H);
    const chunk = db.Dbase[chunkIndex];
    if (!chunk) return 1;
    return chunk.MazeArr[arrayRow]?.[x] ?? 1;
  }

  setTile(x, globalY, value) {
    if (globalY < 0) return;
    const H = db.HStandart;
    const chunkIndex = Math.floor(globalY / H) - (db.removedChunks ?? 0);
    const arrayRow = H - 1 - (globalY % H);
    const chunk = db.Dbase[chunkIndex];
    if (chunk) chunk.MazeArr[arrayRow][x] = value;
  }

  move(dy) {
    const ny = this.globalY + dy;
    const tile = this.getTile(this.x, ny);
    if (tile === 1) return;
    const item = Object.entries(ITEM_DEFS).find(([, d]) => d.mapCode === tile);
    if (item) {
      this.inventory.push(item[0]);
      console.log(`Picked up ${item[0]}!`);
      this.setTile(this.x, ny, 0);
    }
    this.globalY = ny;
  }

  moveX(dx) {
    const nx = this.x + dx;
    if (nx < 0 || nx >= db.WStandart) return;
    const tile = this.getTile(nx, this.globalY);
    if (tile === 1) return;
    const item = Object.entries(ITEM_DEFS).find(([, d]) => d.mapCode === tile);
    if (item) {
      this.inventory.push(item[0]);
      this.setTile(nx, this.globalY, 0);
    }
    this.x = nx;
  }

  up() {
    this.img = this.ThisIMG.up;
    this.move(+1);
  }
  down() {
    this.img = this.ThisIMG.down;
    this.move(-1);
  }
  right() {
    this.img = this.ThisIMG.right;
    this.moveX(+1);
  }
  left() {
    this.img = this.ThisIMG.left;
    this.moveX(-1);
  }

  draw(scrollOffset = 0) {
    const relativeY = this.globalY - (db.removedChunks ?? 0) * db.HStandart;
    const screenY = height - (relativeY - scrollOffset + 1) * cellSize;
    image(this.img, this.x * cellSize, screenY, cellSize, cellSize);
  }
}
