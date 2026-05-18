import { MazeDataBase } from "../../shared/Mazegen.js";
import { CharSet } from "../Charset.js";
import { Player } from "../player.js";

const colyseusClient = new Colyseus.Client(
  "wss://special-space-couscous-694w5q5rvg99cjx4-2567.app.github.dev",
);
let room;

let level = [];
export let cellSize = 0;
let mazeSize = 15;
let player;

let announcements = [];

function showAnnouncement(text, duration) {
  announcements.push({
    text,
    until: millis() + duration,
  });
}

export const db = new MazeDataBase([], mazeSize, mazeSize, 1, 2);

// Centralized item definitions — mirrors items.json
// mapCode matches the number stored in the maze array cell
export const ITEM_DEFS = {
  Axe: { mapCode: 3, image: "client/images/Toolset/Axe.png" },
  Health: { mapCode: 5, image: "client/images/Toolset/Health.png" },
};

// Map cell codes:
//   0 = empty path
//   1 = wall
//   2 = exit
//   3 = Axe      (see ITEM_DEFS)
//   5 = Health   (see ITEM_DEFS)

// Texture sets for walls — one set is chosen per chunk at generation time.
// Each entry maps a set name to the list of tileable texture filenames.
// Paths are relative to client/images/textures/.
const TEXTURE_SETS = {
  cave: [
    "cave/Tileable10c.png",
    "cave/Tileable10d.png",
    "cave/Tileable1d.png",
    "cave/Tileable1h.png",
    "cave/Tileable2f.png",
    "cave/Tileable2i.png",
    "cave/Tileable3c.png",
    "cave/Tileable3h.png",
    "cave/Tileable4c.png",
    "cave/Tileable4h.png",
    "cave/Tileable5e.png",
    "cave/Tileable6e.png",
    "cave/Tileable7e.png",
    "cave/Tileable7g.png",
    "cave/Tileable8c.png",
    "cave/Tileable9c.png",
  ],
  city: [
    "city/Tileable1b.png",
    "city/Tileable1c.png",
    "city/Tileable1g.png",
    "city/Tileable2a.png",
    "city/Tileable2b.png",
    "city/Tileable3f.png",
    "city/Tileable3j.png",
    "city/Tileable4a.png",
    "city/Tileable4i.png",
    "city/Tileable5a.png",
    "city/Tileable5b.png",
    "city/Tileable5d.png",
    "city/Tileable5j.png",
    "city/Tileable6b.png",
    "city/Tileable6d.png",
    "city/Tileable7a.png",
    "city/Tileable7h.png",
    "city/Tileable8d.png",
    "city/Tileable8e.png",
    "city/Tileable9f.png",
  ],
  desert: [
    "desert/Tileable10y.png",
    "desert/Tileable1a.png",
    "desert/Tileable2d.png",
    "desert/Tileable3a.png",
    "desert/Tileable4y.png",
    "desert/Tileable5y.png",
    "desert/Tileable6y.png",
    "desert/Tileable7c.png",
    "desert/Tileable8b.png",
    "desert/Tileable8y.png",
    "desert/Tileable9y.png",
  ],
  ice: [
    "ice/Tileable10b.png",
    "ice/Tileable1e.png",
    "ice/Tileable1f.png",
    "ice/Tileable2e.png",
    "ice/Tileable3d.png",
    "ice/Tileable3g.png",
    "ice/Tileable3i.png",
    "ice/Tileable4d.png",
    "ice/Tileable4e.png",
    "ice/Tileable4h.png",
    "ice/Tileable5c.png",
    "ice/Tileable6c.png",
    "ice/Tileable6f.png",
    "ice/Tileable7b.png",
    "ice/Tileable8c.png",
    "ice/Tileable9a.png",
  ],
  ruins: [
    "ruins/Tileable10e.png",
    "ruins/Tileable1k.png",
    "ruins/Tileable2k.png",
    "ruins/Tileable3k.png",
    "ruins/Tileable4k.png",
    "ruins/Tileable5k.png",
    "ruins/Tileable6k.png",
    "ruins/Tileable7i.png",
    "ruins/Tileable8f.png",
    "ruins/Tileable9k.png",
  ],
};

// Floor / special cell colours (walls use textures instead)
let cellColour = [
  "#111826", // 0: empty path / floor
  "#2a2a2a", // 1: wall fallback (used only when texture hasn't loaded)
  "#1db954", // 2: exit
  "#111826", // 3: axe item (drawn over floor colour)
  "#111826", // 4: reserved
  "#111826", // 5: health item (drawn over floor colour)
];

// itemImages[mapCode] = p5.Image, populated in preload()
let itemImages = {};

// charSetImages[charName] = { up, right, down, left } of p5.Image, populated in preload()
export let charSetImages = {};

// wallTextures['set/file.png'] = p5.Image — all sets loaded upfront in preload()
let wallTextures = {};

const GSPLAY = 0;
const GSLOSE = 1;
const GSWIN = 2;
let gameState = GSPLAY;

// Returns a random texture key (e.g. 'cave/Tileable3h.png') from TEXTURE_SETS.
function pickTexture() {
  const sets = Object.keys(TEXTURE_SETS);
  const set = sets[Math.floor(Math.random() * sets.length)];
  const files = TEXTURE_SETS[set];
  return files[Math.floor(Math.random() * files.length)];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  ellipseMode(CORNER);
  noStroke();

  document.getElementById("new-game-btn").addEventListener("click", initLevel);
  initLevel();
}

let lastTime = 0;
let scrollStarted = false;
let gameStartTime = 0;
let lastSpeedUp = 0;

function draw() {
  const now = millis();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  if (!scrollStarted) {
    if (millis() - gameStartTime > 3000) scrollStarted = true;
  } else {
    db.ScrollOffset += db.ScrollSpeed * dt;

    if (now - lastSpeedUp >= 20000) {
      db.ScrollSpeed *= 1.5;
      lastSpeedUp = now;
    }
  }

  // Death — eaten by the bottom scroll
  const absoluteScrollOffset =
    db.ScrollOffset + (db.removedChunks ?? 0) * mazeSize;
  if (player.globalY < absoluteScrollOffset) gameState = GSLOSE;

  // Generate next chunk when player nears the top of the known tower
  const maxGlobalY = db.Dbase.length * mazeSize - 1;
  if (player.globalY > maxGlobalY - 5) {
    db.generateMaze(pickTexture());
  }

  // Drop the bottom chunk once it has scrolled fully off screen
  if (db.ScrollOffset >= mazeSize) {
    db.Dbase.shift();
    db.ScrollOffset -= mazeSize;
    db.removedChunks = (db.removedChunks ?? 0) + 1;
  }

  background(6, 13, 26);

  for (let ci = 0; ci < db.Dbase.length; ci++) {
    const chunk = db.Dbase[ci];
    const chunkBaseY = ci * mazeSize;
    const texImg = wallTextures[chunk.maze_texture];

    for (let y = 0; y < mazeSize; y++) {
      const arrayRow = mazeSize - 1 - y; // y=0 → bottom of chunk → last array row
      for (let x = 0; x < mazeSize; x++) {
        const globalY = chunkBaseY + y;
        const screenY = height - (globalY - db.ScrollOffset + 1) * cellSize;

        if (screenY > height || screenY < -cellSize) continue;

        const cellCode = chunk.MazeArr[arrayRow][x];

        if (cellCode === 1) {
          // Wall: use chunk texture; fallback to solid colour
          if (texImg) {
            image(texImg, x * cellSize, screenY, cellSize, cellSize);
          } else {
            fill(cellColour[1]);
            rect(x * cellSize, screenY, cellSize, cellSize);
          }
        } else {
          fill(cellColour[cellCode] ?? cellColour[0]);
          rect(x * cellSize, screenY, cellSize, cellSize);
          const itemImg = itemImages[cellCode];
          if (itemImg)
            image(itemImg, x * cellSize, screenY, cellSize, cellSize);
        }
      }
    }
  }

  player.draw(db.ScrollOffset);
  drawAnnouncements();
  //draw announcements every rate
  if (gameState === GSLOSE) {
    fill(0, 0, 0, 160);
    rect(0, 0, width, height);
    fill(220, 50, 50);
    textSize(60);
    textAlign(CENTER, CENTER);
    text("YOU DIED", width / 2, height / 2);
  }
}

function drawAnnouncements() {
  const now = millis();
  // so we clean active announcements
  announcements = announcements.filter((a) => a.until > now);

  // and draw the new ones
  announcements.forEach((a, i) => {
    const alpha = map(a.until - now, 0, 500, 0, 255);
    fill(255, 255, 255, alpha);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(a.text, width / 2, height / 2 - i * 50);
  });
}

function keyPressed() {
  switch (key) {
    case "w":
      player.up();
      break;
    case "d":
      player.right();
      break;
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
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let id = "";
  for (let i = 0; i < 5; i++) {
    id += chars.charAt(floor(random(chars.length)));
  }
  return id;
}

async function initLevel() {
  db.Dbase = [];
  db.ScrollOffset = 0;
  db.currentMaze = 0;
  db.removedChunks = 0;
  scrollStarted = false;

  try {
    room = await colyseusClient.joinOrCreate("game_room", { name: "Deni" });
    console.log("✅ Joined room:", room.id);

    room.onMessage("game_start", (msg) => {
      gameStartAt = msg.startAt;
    });
  } catch (e) {
    console.warn("Сервер недоступен, играем одни:", e.message);
  }
  // gameStartTime = millis() // millist is a p5 function i use. It returns the amo of ms since the start of the programm;
  // lastSpeedUp = millis();
  gameState = GSPLAY;

  db.generateMaze(pickTexture());
  db.generateMaze(pickTexture());
  db.generateMaze(pickTexture());

  cellSize = floor(min(width, height) / mazeSize);

  const firstChunk = db.Dbase[0];
  player = new Player(
    firstChunk.StartX,
    0,
    "local",
    "NindjiaSET",
    "red",
    "Player1",
    [],
  );
}

//Preleads the Texture packs
function preload() {
  // Character image sets
  Object.entries(CharSet).forEach(([name, paths]) => {
    charSetImages[name] = {
      up: loadImage(paths.up),
      right: loadImage(paths.right),
      down: loadImage(paths.down),
      left: loadImage(paths.left),
    };
  });

  // Item images
  Object.entries(ITEM_DEFS).forEach(([, def]) => {
    itemImages[def.mapCode] = loadImage(def.image);
  });

  // All wall textures (loaded once; each chunk picks one at generation time)
  Object.values(TEXTURE_SETS).forEach((files) => {
    files.forEach((file) => {
      wallTextures[file] = loadImage(`client/images/textures/${file}`);
    });
  });
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
window.preload = preload;
