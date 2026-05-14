import { MazeDataBase } from "../../shared/Mazegen.js";
import { CharSet } from "../Charset.js";
import { Player } from "../player.js";
/**
 * Really ~Simple~ INTERESTING Maze game
 * Array holds maze data
 * Player has coordinates and these are changed according to keypress and array content
 * If the player reaches the exit, then win
 * If the player stumbles in to the firepit then lose
 */

// TASK 4: declare required variables

// TODO: declare a variable called level
let level = [];
// TODO: declare a variable called cellSize
export let cellSize = 0;
// TODO: declare a constant called mazeSize with a value of 7
let mazeSize = 15;
// TODO: declare a variable called player
let player;

export const db = new MazeDataBase([], mazeSize, mazeSize, 1, 2);

// Centralized item definitions — mirrors items.json
// mapCode matches the number stored in the maze array cell
export const ITEM_DEFS = {
  Axe: { mapCode: 3, image: "images/Toolset/Axe.png" },
  Health: { mapCode: 5, image: "images/Toolset/Health.png" },
};

// Map cell codes:
//   0 = empty path
//   1 = wall
//   2 = exit
//   3 = Axe      (see ITEM_DEFS / items.json)
//   5 = Health   (see ITEM_DEFS / items.json)

// array of colours for maze parts
// index matches the cell code above (4 is reserved, currently unused)
let cellColour = ["white", "grey", "green", "white", "white", "white"];

// itemImages[mapCode] = p5.Image, populated in preload()
let itemImages = {};

// charSetImages[charName] = { up, right, down, left } of p5.Image, populated in preload()
// Other files import this to resolve a player's ThisIMG by charset name.
export let charSetImages = {};

// game state variable and constants
const GSPLAY = 0;
const GSLOSE = 1;
const GSWIN = 2;
let gameState = GSPLAY;

function setup() {
  createCanvas(windowWidth, windowHeight);
  console.log("The maze created");
  background(150);
  ellipseMode(CORNER);
  noStroke();
  // add the reset button
  let b = createButton("New Game");
  b.position(0, 0);
  b.mousePressed(initLevel);
  initLevel();
}

// script.js
let lastTime = 0;

function draw() {
  const now = millis();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  // двигаем мир вниз
  db.ScrollOffset += db.ScrollSpeed * dt;

  // смерть
  if (player.globalY < db.ScrollOffset) {
    gameState = GSLOSE;
  }

  // рисуем
  background(150);
  for (let y = 0; y < mazeSize; y++) {
    for (let x = 0; x < mazeSize; x++) {
      const screenY = (y - db.ScrollOffset) * cellSize;
      fill(cellColour[level[y][x]]);
      rect(x * cellSize, screenY, cellSize, cellSize);
      const img = itemImages[level[y][x]];
      if (img) image(img, x * cellSize, screenY, cellSize, cellSize);
    }
  }

  player.draw();

  if (gameState === GSLOSE) {
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    fill(255, 0, 0);
    textSize(60);
    textAlign(CENTER, CENTER);
    text("YOU DIED", width / 2, height / 2);
  }
}

function keyPressed() {
  // use wasd to navigate
  switch (key) {
    case "w":
      player.up();
      break;
    case "d":
      player.right();
      break;
    // TASK 6: complete the player movement code

    case "s":
      player.down();
      break;
    case "a":
      player.left();
      break;
    default:
      break;
  }
}

function generateRoomID() {
  // generates a random 5 letter string for RoomID
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let id = "";
  for (let i = 0; i < 5; i++) {
    id += chars.charAt(floor(random(chars.length)));
  }
  return id;
}

function initLevel() {
  // a 7x7 array represents level
  // 0 = path, 1 = wall, 2 = exit, 3 = Axe, 5 = Health
  //RoomID, Players, Spectators, World, GameState, MaxPlayers, Ticks

  let lobby = new GameRoom(generateRoomID(), [], [], db.Dbase, "waiting", 4, 0);
  db.generateMaze();
  level = db.Dbase[db.Dbase.length - 1].MazeArr;
  console.log("The level:");
  console.log(level);
  gameState = GSPLAY;
  // fit the maze in to the screen
  cellSize = floor(min(width / mazeSize, height / mazeSize));
  let maze = db.Dbase[db.Dbase.length - 1];
  // "NindjiaSET" is the charset name — Player resolves images via charSetImages["NindjiaSET"]
  player = new Player(
    maze.StartX,
    maze.StartY,
    "local",
    "NindjiaSET",
    "red",
    "Player1",
    [],
  );
  lobby.addPlayer(player);
  lobby.World = level;
  lobby.startGame();
}

function preload() {
  // Load all character image sets from CharSet config — one entry per charset
  Object.entries(CharSet).forEach(([name, paths]) => {
    charSetImages[name] = {
      up: loadImage(paths.up),
      right: loadImage(paths.right),
      down: loadImage(paths.down),
      left: loadImage(paths.left),
    };
  });

  // Load all item images by iterating ITEM_DEFS — add new items to ITEM_DEFS only
  Object.entries(ITEM_DEFS).forEach(([, def]) => {
    itemImages[def.mapCode] = loadImage(def.image);
  });
}

// p5.js global mode requires these on window when script.js is a module
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.preload = preload;
