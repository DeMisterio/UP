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

  draw(scrollOffset = 0) {
    const screenY = (this.globalY - scrollOffset) * cellSize;
    image(this.img, cellSize * this.x, screenY, cellSize, cellSize);
  }

  up() {
    this.img = this.ThisIMG.up;
    this.slideMove(
      db.Dbase[db.Dbase.length - 1].MazeArr,
      [0, -1],
      ITEM_DEFS,
      this.inventory,
    );
  }

  right() {
    this.img = this.ThisIMG.right;
    this.slideMove(
      db.Dbase[db.Dbase.length - 1].MazeArr,
      [1, 0],
      ITEM_DEFS,
      this.inventory,
    );
  }

  down() {
    this.img = this.ThisIMG.down;
    this.slideMove(
      db.Dbase[db.Dbase.length - 1].MazeArr,
      [0, 1],
      ITEM_DEFS,
      this.inventory,
    );
  }

  left() {
    this.img = this.ThisIMG.left;
    this.slideMove(
      db.Dbase[db.Dbase.length - 1].MazeArr,
      [-1, 0],
      ITEM_DEFS,
      this.inventory,
    );
  }

  slideMove(maze, dir, itemList, inventory) {
    let nx = this.x + dir[0];
    let ny = this.globalY + dir[1];

    while (
      ny >= 0 &&
      ny < maze.length &&
      nx >= 0 &&
      nx < maze[0].length &&
      maze[ny][nx] !== 1
    ) {
      const cell = maze[ny][nx];
      const itemEntry = Object.entries(itemList).find(
        ([, def]) => def.mapCode === cell,
      );
      if (itemEntry) {
        inventory.push(itemEntry[0]);
        console.log(
          `Picked up ${itemEntry[0]}! Inventory: ${inventory.join(", ")}`,
        );
        maze[ny][nx] = 0;
      }

      this.x = nx;
      this.globalY = ny;
      nx += dir[0];
      ny += dir[1];
    }
  }
}
