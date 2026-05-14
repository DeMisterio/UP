import { db, ITEM_DEFS, charSetImages, cellSize } from "./script.js";
/**
 * The Player class defines the functions to draw and move the player
 * the player coordinates are stored (this.x,this.y) as is the current image (this.img)
 * this could be extended to include player health and other attributes
 */
export class Player {
  constructor(x, y, PlayerID, ThisIMG, TrailColor, Uname, inventory) {
    this.x = x;
    this.y = y;
    this.PlayerID = PlayerID;
    // ThisIMG is the charset name (e.g. "NindjiaSET")
    // charSetImages resolves it to { up, right, down, left } of p5.Image
    this.ThisIMG = charSetImages[ThisIMG];
    this.img = this.ThisIMG.right; // Defines the default image (facing right)
    this.inventory = inventory ?? [];
  }

  draw() {
    // player is represented by a static character
    image(this.img, cellSize * this.x, cellSize * this.y, cellSize, cellSize);
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

  // dir is [dx, dy]: [1,0]=right, [-1,0]=left, [0,1]=down, [0,-1]=up
  // itemList = ITEM_DEFS — { itemName: { mapCode, image } }
  slideMove(maze, dir, itemList, inventory) {
    let nx = this.x + dir[0];
    let ny = this.y + dir[1];

    while (
      ny >= 0 &&
      ny < maze.length &&
      nx >= 0 &&
      nx < maze[0].length &&
      maze[ny][nx] !== 1 // stop at walls
    ) {
      const cell = maze[ny][nx];
      // Look up item by mapCode and add its name to inventory
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
      this.y = ny;
      nx += dir[0];
      ny += dir[1];
    }
  }
}
