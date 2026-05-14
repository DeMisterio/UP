export class MazeDataBase {
  constructor(
    Dbase,
    WStandart,
    HStandart,
    AxeSpawnStandart,
    HealthSpawnStandart,
  ) {
    this.Dbase = Dbase;
    this.currentMaze = 0;
    this.WStandart = WStandart;
    this.ScrollOffset = 0;
    this.ScrollSpeed = 0.3; // клеток/сек
    this.HStandart = HStandart;
    this.AxeSpawnStandart = AxeSpawnStandart;
    this.HealthSpawnStandart = HealthSpawnStandart;
    //Simpy pass the end of the last array which will be the beginning for the next generated (if so) array
    //If does not exists => we pass the random coordinate!
    this.LastExitCords = (() => {
      if (Dbase.length != 0) {
        const grid = Dbase[Dbase.length - 1];
        const x = grid[0]?.indexOf(2);
        return x === -1 || x === undefined
          ? [
              Math.floor(Math.random() * (grid[0].length - 0 - 1)) + (0 + 1),
              this.HStandart - 3,
            ]
          : [x, this.HStandart - 3];
      } else {
        return [
          Math.floor(Math.random() * (this.WStandart - 0 - 1)) + (0 + 1),
          this.HStandart - 3,
        ];
      }
    })();
  }
  generateMaze() {
    //Generate a new mase and add to the list od mazes
    let NewMaze = new Maze(
      this.WStandart,
      this.HStandart,
      this.LastExitCords,
      this.AxeSpawnStandart,
      this.HealthSpawnStandart,
    );
    this.Dbase.push(NewMaze);
    this.currentMaze++;
    return NewMaze;
  }
  cleanDbase() {
    this.Dbase = [];
  }
}

export class Maze {
  constructor(
    WStandart,
    HStandart,
    LastExitCords,
    AxeSpawnProb,
    HealthSpawnProb,
  ) {
    this.W = WStandart;
    this.H = HStandart;
    this.ExitCords = LastExitCords;
    this.AxeSpawnProb = AxeSpawnProb;
    this.HealthSpawnProb = HealthSpawnProb;
    this.MazeArr = this.generateMaze();
  }
  generateMaze() {
    //Maze data is a stack that holds the track path (the key element of recursive backtracking)
    let MazeData = [];
    let pointer = 0; // Start position
    // Cell codes used in the maze array:
    //   0 = empty path
    //   1 = wall (default fill)
    //   2 = exit (placed at EndY, EndX after generation)
    //   3 = Axe  (spawned with probability AxeSpawnProb)
    //   5 = Health (spawned with probability HealthSpawnProb)
    //Create a 2D array pre-filled with 1's (walls)
    let Maze = Array.from({ length: this.H }, () => Array(this.W).fill(1));

    //Available motion
    let Available_Motion = [
      [0, 2],
      [0, -2],
      [2, 0],
      [-2, 0],
    ]; // => right, left, up and down

    // THe End of the Maze

    let EndX = Math.floor(Math.random() * Math.floor((this.W - 2) / 2)) * 2 + 1;
    let EndY = 0; // though the upper side of the 2d array is on the top

    // The start of the Maze
    let StartX = Math.floor(this.ExitCords[0] / 2) * 2 + 1;
    let StartY = Math.floor(this.ExitCords[1] / 2) * 2 + 1;

    // From now there; we can write a mazegen loop
    let x = StartX;
    let y = StartY;
    Maze[y][x] = 0;
    //Last direction we went to
    let lastDirection = null;

    let recursion = true;
    while (recursion == true) {
      let Neighbourfound = false;
      //Shuffly the directions and then pich first one that is available
      let Shuffled_Motion = Available_Motion.slice().sort(
        () => Math.random() - 0.5,
      );
      // Demote "straight" below 25% by occasionally pushing it to the back
      if (lastDirection && Math.random() < 0.7) {
        const idx = Shuffled_Motion.findIndex(
          (d) => d[0] === lastDirection[0] && d[1] === lastDirection[1],
        );
        if (idx !== -1) Shuffled_Motion.push(Shuffled_Motion.splice(idx, 1)[0]);
      }
      for (let i = 0; i < Shuffled_Motion.length; i++) {
        let direction = Shuffled_Motion[i];
        if (
          !MazeData.some(
            (c) => c[0] === x + direction[1] && c[1] === y + direction[0],
          ) &&
          x + direction[1] > 0 &&
          y + direction[0] > 0 &&
          x + direction[1] < this.W &&
          y + direction[0] < this.H
        ) {
          //neighbour available
          MazeData.push([x + direction[1], y + direction[0]]);
          pointer = 0;
          Maze[y + direction[0]][x + direction[1]] =
            Math.random() * 100 < this.AxeSpawnProb
              ? 3 /* Axe */
              : Math.random() * 100 < this.AxeSpawnProb + this.HealthSpawnProb
                ? 5 /* Health */
                : 0 /* path */;
          Maze[(y + y + direction[0]) / 2][(x + x + direction[1]) / 2] = 0; // The Path to neighbour is now made
          x = x + direction[1];
          y = y + direction[0];
          lastDirection = direction;
          Neighbourfound = true;
          break;
        }
      }
      if (Neighbourfound == false) {
        if (MazeData.length == 0 || pointer - 1 < -MazeData.length) {
          //Means we did fully backtrace
          recursion = false;
        } else {
          pointer -= 1;
          x = MazeData.at(pointer)[0];
          y = MazeData.at(pointer)[1];
          //went one step back
          lastDirection = null;
        }
      }
    }
    Maze[EndY][EndX] = 2; // exit cell
    Maze[1][EndX] = 0; // carve path from exit into maze
    Maze[this.H - 1][StartX] = 0; // carve entrance at bottom border
    this.StartX = StartX;
    this.StartY = StartY;
    return Maze;
  }
}
