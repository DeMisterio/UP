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
    this.health = 3;
    this.TrailColor = TrailColor;
    this.IsAlive = true;
  }

  //One of the most important line over there - gettiin global y
  getTile(x, globalY) {
    // underground doesnt exist so treat it as a wall so i cant fall below row 0
    if (globalY < 0) return 1;
    // H is how many rows tall one chunk is (for my code it is 15)
    const H = this.db.HStandart;

    // divide globalY by chunk height to know WHICH chunk im in =>

    // then subtract how many chunks were already deleted from the bottom
    // so the index lines up with whats actually still in db.Dbase[]
    // The Dbase is -> A queue! so to get an actual index position, we remove row may indexes from a beginning we have already deleted.
    const chunkIndex = Math.floor(globalY / H) - (this.db.removedChunks ?? 0);

    // Finds the row inside the chunk we are in, and then flip it (though we are counting from bottom to the. top)
    const arrayRow = H - 1 - (globalY % H);

    // grab the actual chunk object from the database
    const chunk = this.db.Dbase[chunkIndex];

    // if the chunk doesnt exist yet we treat it as a wall
    if (!chunk) return 1;

    // read the cell — if somehow x is out of bounds, default to 1 (wall) so i dont crash
    return chunk.MazeArr[arrayRow]?.[x] ?? 1;
  }

  setTile(x, globalY, value) {
    // cant write below the floor, just bail
    if (globalY < 0) return;

    // same coordinate math as getTile, we find the chunk and the row
    const H = this.db.HStandart;
    const chunkIndex = Math.floor(globalY / H) - (this.db.removedChunks ?? 0);
    const arrayRow = H - 1 - (globalY % H);
    const chunk = this.db.Dbase[chunkIndex];
    // only write if the chunk actually exists (it might have scrolled off)
    if (chunk) chunk.MazeArr[arrayRow][x] = value;
  }

  move(dy) {
    const ny = this.globalY + dy;
    const tile = this.getTile(this.x, ny);
    if (tile === 1) return;
    const item = Object.entries(this.items).find(([, d]) => d.mapCode === tile);
    if (item) {
      if (item[0] === "Health") {
        this.health = Math.min(this.health + 1, 3);
      } else {
        this.inventory.push(item[0]);
      }
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
      if (item[0] === "Health") {
        this.health = Math.min(this.health + 1, 3);
      } else {
        this.inventory.push(item[0]);
      }
      this.setTile(nx, this.globalY, 0);
    }
    this.x = nx;
  }

  up() {
    this.img = this.imgSet.up;
    this.move(+1);
  }
  down() {
    this.img = this.imgSet.down;
    this.move(-1);
  }
  right() {
    this.img = this.imgSet.right;
    this.moveX(+1);
  }
  left() {
    this.img = this.imgSet.left;
    this.moveX(-1);
  }

  draw(scrollOffset, cellSize) {
    // globalY counts from the very beginning of the game (never resets),
    // but removed chunks are gone from the world, so i subtract their total height
    // to get a Y that starts from the bottom of whatever is currently alive
    const relativeY =
      this.globalY - (this.db.removedChunks ?? 0) * this.db.HStandart;

    // the screen draws top-to-bottom (y=0 is the top edge),
    // but my world counts bottom-to-top (row 0 is the floor).
    // so i flip: start from the bottom of the screen (height),
    // then go UP by how many cells i am above the scroll camera.
    // the +1 shifts by one full cell so the player sits ON the row, not above it.
    const screenY = height - (relativeY - scrollOffset + 1) * cellSize;

    // finally draw — x is straightforward, just multiply cell index by pixel size
    image(this.img, this.x * cellSize, screenY, cellSize, cellSize);
  }
}
