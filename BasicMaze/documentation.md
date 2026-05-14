This simple maze game uses a 2d array to represent a maze
The array holds integer values representing
0 path
1 wall
2 exit
3 Axe
4 Health

- Advanced maze generation algorith workflow:
  1. Create the List filled with ONLY walls (One's)
  2. Create the stack for path gen algorithm
  3. Generate the starting position of the player. In our game, the maze will be insanely hight labirynth which will move down (so the player will have to find his way up)
  4. Create a list of valid movements (for 2 dimension):
     Example: [-1;0][1;0] (horizontal)
     Example: [0;-1][1;0] (vertical)
  5. Now, we can start chaotically dig our path
  6. We set a start point and from there, we create a temp2d array, and then the algorithm repetatively does this:
  - Get the coordinates of neighboars avalable: [UserX; UserY+1]; [UserX+; UserY]; [UserX; UserY-1]; [UserX-1; UserY]
  - Check what neighbour is available (Not available -> Out of the list/in a stack of visited)

  - Case 1:
    - If the neighbour is available, change UserX and UserY to neighbour coordinted, and remove the wall at [(UserX + NeighbourX)/2; (UserY + NeighbourY)/2] => the wall between them
    - Then add this neighbour coordinates on the top of the stack And continue the iteration from beginning

  - Case 2:
    - If the neighbour is anavailable, change the pointer to -1 (backtrack) and restart iteration (it will keep backtracking untill finds available path)

    - If the pointer reaches the beginning of the path (it means it has backtracked) => Congratulations; the maze is ready

- Now, since we have a logic for generating one chunck, THIS LOGIC will be repeated continiously, and the walls will be merged, so they stack on the top of each other. The Exit for the bottom maze becomes the entrance for the top maze.

- A D V A N C E D C H A R A C T E R M A N A G E M E N T
  - The use constructor will hold this parameters:

    User_path_history: the stack that holds user coordinates

    User_inventory: holds the items user has

    ThisY; ThisX; ThisIMG;

- A D V A N C E D G A M E M E C H A N I C S
  - THE GAMEPLAY LOOP

    You control a character in a maze that is CONSTANTLY MOVING DOWN. Your only goal is to CLIMB as fast as possible to stay on the screen.

  - CORE MECHANICS

    VERTICAL CLIMBER: The maze never ends. You must keep moving UP to avoid being crushed by the bottom of the screen.

    THE AXE: You can collect axes to BREAK WALLS. Use them to create your own shortcuts or escape when you get stuck in a dead end.

    PAINT TRAIL: Your character leaves a colored trail behind. This helps you remember where you have already been so you don't waste time going into the same dead end twice.

    LEVEL SEPARATORS: Every time you reach a new section, a RED LINE (or wall) marks your progress. It acts as a checkpoint for your eyes.

    HINTS: If the maze gets too hard, the correct path will GLOW for a second to show you the way.

    COLLECTIBLES: Pick up items like HEALTH or AXES to stay alive and keep your strategy moving.

  - Multiplayer intergrity

    Using NodeJS + GItHub codespaces, multiplayer mode can be implemented. The matchmaking starts with X players in the lobby. Other can be spectators

**`client/script.js`**
Запускает p5.js. Рисует лабиринт, игроков, HUD. Слушает клавиши и отправляет их на сервер. Получает обновления от сервера и передаёт в draw(). Больше ничего.

---

**`client/player.js`**
Знает как нарисовать одного игрока и его след. Меняет спрайт в зависимости от направления. Всё.

---

**`client/Charset.js`**
Список путей к картинкам персонажей. Только данные, никакой логики.

---

**`shared/Mazegen.js`**
Генерирует лабиринт. Хранит стек чанков. Используется сервером чтобы создавать чанки, клиентом чтобы их хранить и рисовать.

---

**`shared/items.json`**
Список предметов — название, код в массиве, путь к картинке. Только данные.

---

**`shared/constants.js`**
Все магические цифры в одном месте. `TILE_WALL = 1`, `TILE_FLOOR = 0` и т.д.

---

**`server/server.js`**
Запускает Colyseus на порту 2567. Регистрирует GameRoom. Всё.

---

**`server/GameRoom.js`**
Мозг игры. Принимает нажатия от клиентов. Проверяет можно ли двигаться. Двигает игроков. Двигает мир вниз. Убивает тех кого съело. Генерирует новые чанки. Рассылает состояние всем. Управляет лобби.

---

Это весь проект. Каждый файл делает одну вещь и не лезет в чужую.
