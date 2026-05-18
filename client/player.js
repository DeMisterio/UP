export class Player {
  constructor(x, y, PlayerID, imgSet, items, db, TrailColor, Uname, inventory) {
    this.x = x;
    this.globalY = y;
    this.PlayerID = PlayerID;
    this.imgSet = imgSet;
    this.img = imgSet.right;
    this.items = items;
    this.db = db;
    this.inventory = inventory ?? [];
    this.TrailColor = TrailColor;
    this.IsAlive = true;
  }

  getTile(x, globalY) {
    if (globalY < 0) return 1;
    const H = this.db.HStandart;
    const chunkIndex = Math.floor(globalY / H) - (this.db.removedChunks ?? 0);
    const arrayRow = H - 1 - (globalY % H);
    const chunk = this.db.Dbase[chunkIndex];
    if (!chunk) return 1;
    return chunk.MazeArr[arrayRow]?.[x] ?? 1;
  }

  setTile(x, globalY, value) {
    if (globalY < 0) return;
    const H = this.db.HStandart;
    const chunkIndex = Math.floor(globalY / H) - (this.db.removedChunks ?? 0);
    const arrayRow = H - 1 - (globalY % H);
    const chunk = this.db.Dbase[chunkIndex];
    if (chunk) chunk.MazeArr[arrayRow][x] = value;
  }

  move(dy) {
    const ny = this.globalY + dy;
    const tile = this.getTile(this.x, ny);
    if (tile === 1) return;
    const item = Object.entries(this.items).find(([, d]) => d.mapCode === tile);
    if (item) {
      this.inventory.push(item[0]);
      console.log(`Picked up ${item[0]}!`);
      this.setTile(this.x, ny, 0);
    }
    this.globalY = ny;
  }

  moveX(dx) {
    const nx = this.x + dx;
    if (nx < 0 || nx >= this.db.WStandart) return;
    const tile = this.getTile(nx, this.globalY);
    if (tile === 1) return;
    const item = Object.entries(this.items).find(([, d]) => d.mapCode === tile);
    if (item) {
      this.inventory.push(item[0]);
      this.setTile(nx, this.globalY, 0);
    }
    this.x = nx;
  }

  up() { this.img = this.imgSet.up; this.move(+1); }
  down() { this.img = this.imgSet.down; this.move(-1); }
  right() { this.img = this.imgSet.right; this.moveX(+1); }
  left() { this.img = this.imgSet.left; this.moveX(-1); }

  draw(scrollOffset, cellSize) {
    const relativeY = this.globalY - (this.db.removedChunks ?? 0) * this.db.HStandart;
    const screenY = height - (relativeY - scrollOffset + 1) * cellSize;
    image(this.img, this.x * cellSize, screenY, cellSize, cellSize);
  }
}
