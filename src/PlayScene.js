// Клас PlayScene відповідає за основну ігрову сцену, розміщення об'єктів, оновлення та малювання гри
var TILE_SIZE = 16;

var EVENT_PLAYSCENE_READY = 'EVENT_PLAYSCENE_READY';

// Конструктор ігрової сцени
function PlayScene(game, maps) {
  this._game = game; // Посилання на головний об'єкт гри
  this._maps = maps || this._getDefaultMaps(); // Масив карт рівнів

  // Ініціалізація повідомлення "READY!"
  this._readyMessage = new ReadyMessage();
  this._readyMessage.setVisibilityDuration(READY_MESSAGE_DURATION_LONG);
  this._readyMessage.show();

  // Ініціалізація вишні (cherry)
  this._cherry = new Cherry(this);

  // Ініціалізація Pacman
  this._pacman = new Pacman(this, game);
  this._pacman.setStrategy(new PacmanPlaySceneStrategy(this._pacman, this));
  this._pacman.setSpeed(4);
  this._pacman.requestNewDirection(DIRECTION_RIGHT);

  this._currentLevel = 1;
  this.loadMap(this._getMapForCurrentLevel());

  this._score = 0;
  this._x = 50;
  this._y = 50;

  this.setGhostScoreValue(200);
  this._pointsMessage = new PointsMessage(this);
  this._pacmanDiesPause = new PacmanDiesPause(this, game);
  this._game.getEventManager().fireEvent({'name': EVENT_PLAYSCENE_READY});
}

// Повертає координату X сцени
PlayScene.prototype.getX = function () {
  return this._x;
};

// Повертає координату Y сцени
PlayScene.prototype.getY = function () {
  return this._y;
};

// Оновлює стан усіх об'єктів сцени (ігровий цикл)
PlayScene.prototype.tick = function () {
  this._pacmanDiesPause.tick();
  this._readyMessage.tick();
  this._pointsMessage.tick();
  this._pacman.tick();

  // Оновлення стану привидів
  for (var ghost in this._ghosts) {
    this._ghosts[ghost].tick();
  }

  // Оновлення стану всіх кульок
  for (var pellet in this._pellets) {
    if (this._pellets[pellet] instanceof PowerPellet) {
      this._pellets[pellet].tick();
    }
  }

  this._cherry.tick();
};

// Малює всі об'єкти сцени
PlayScene.prototype.draw = function (ctx) {
  for (var wall in this._walls) {
    this._walls[wall].draw(ctx);
  }

  for (var pellet in this._pellets) {
    this._pellets[pellet].draw(ctx);
  }

  this._cherry.draw(ctx);
  this._pacman.draw(ctx);

  for (var ghost in this._ghosts) {
    this._ghosts[ghost].draw(ctx);
  }

  this._gate.draw(ctx);
  this._drawScore(ctx);
  this._drawLives(ctx);
  this._pointsMessage.draw(ctx);
  this._readyMessage.draw(ctx);
};

// Малює рахунок гравця
PlayScene.prototype._drawScore = function (ctx) {
  var SCORE_X = 55;
  var SCORE_Y = 30;
  ctx.fillStyle = "#dedede";
  ctx.font = "bold 14px 'Lucida Console', Monaco, monospace"
  var text = "SCORE: " + this._score;
  ctx.fillText(text, SCORE_X, SCORE_Y);
};

// Малює кількість життів Pacman
PlayScene.prototype._drawLives = function (ctx) {
  var x = 55;
  var width = 18
  var y = 430;

  for (var i = 0; i < this._pacman.getLivesCount(); ++i) {
    ctx.drawImage(ImageManager.getImage('pacman_3l'), x + i * width, y);
  }
};

// Обробка натискання клавіш на ігровій сцені
PlayScene.prototype.keyPressed = function (key) {
  this._pacman.keyPressed(key);
};

// Повертає об'єкт повідомлення "READY!"
PlayScene.prototype.getReadyMessage = function () {
  return this._readyMessage;
};

// Повертає об'єкт Pacman
PlayScene.prototype.getPacman = function () {
  return this._pacman;
};

// Завантажує карту рівня та розміщує всі об'єкти на сцені
PlayScene.prototype.loadMap = function (map) {
  this._walls = [];
  this._pellets = [];
  this._ghosts = [];

  var numRows = map.length;
  var numCols = map[0].length;

  this._mapRows = numRows;
  this._mapCols = numCols;

  for (var row = 0; row < numRows; ++row) {
    for (var col = 0; col < numCols; ++col) {
      var tile = map[row][col];
      var position = new Position(col * TILE_SIZE, row * TILE_SIZE);

      if (tile == '#') {
        var wall = new Wall(this._getWallImage(map, row, col), this);
        wall.setPosition(position);
        this._walls.push(wall);
      }
      else if (tile == '.') {
        var pellet = new Pellet(this);
        pellet.setPosition(position);
        this._pellets.push(pellet);
      }
      else if (tile == 'O') {
        var powerPellet = new PowerPellet(this);
        powerPellet.setPosition(position);
        this._pellets.push(powerPellet);
      }
      else if (tile == '-') {
        this._lairPosition = new Position(position.x, position.y + TILE_SIZE);

        var gate = new Gate(this);
        position.y += (TILE_SIZE - GATE_HEIGHT) / 2 + 1;
        gate.setPosition(position);
        this._gate = gate;
      }
      else if (tile == 'C') {
        this._pacman.setStartPosition(position);
        this._pacman.setPosition(position);
        this._pacman.setFrame(0);

        this._cherry.setPosition(position);
      }
      else if (tile == '1' || tile == '2' || tile == '3' || tile == '4') {
        // --- Тут створюються привиди ---
        var name;
        if (tile == '1') {
          name = GHOST_BLINKY;
        }
        else if (tile == '2') {
          name = GHOST_PINKY;
        }
        else if (tile == '3') {
          name = GHOST_INKY;
        }
        else if (tile == '4') {
          name = GHOST_CLYDE;
        }
        var ghost = new Ghost(name, this);
        ghost.setPosition(position);
        ghost.setStartPosition(position);
        this._ghosts.push(ghost);
      }
    }
  }

  // Встановлення випадкового напрямку для кожного привида
  for (var i in this._ghosts) {
    this._ghosts[i].setRandomDirectionNotBlockedByWall();
  }
};

// Визначає тип зображення для стіни залежно від оточення
PlayScene.prototype._getWallImage = function (map, row, col) {
  var numRows = map.length;
  var numCols = map[0].length;
  var lastRow = numRows - 1;
  var lastCol = numCols - 1;

  if ((col > 0 && col < lastCol) &&
      (map[row][col-1] == '#' && map[row][col+1] == '#') &&
      ((row == 0 || map[row-1][col] != '#') && (row == lastRow || map[row+1][col] != '#'))) {
    return 'wall_h';
  }
  else if ((row > 0 && row < lastRow) &&
      (map[row-1][col] == '#' && map[row+1][col] == '#') &&
      ((col == 0 || map[row][col-1] != '#') && (col == lastCol || map[row][col+1] != '#'))) {
    return 'wall_v';
  }
  else if ((col < lastCol && row < lastRow) &&
      (map[row][col+1] == '#' && map[row+1][col] == '#') &&
      ((col == 0 || map[row][col-1] != '#') && (row == 0 || map[row-1][col] != '#'))) {
    return 'wall_tlc';
  }
  else if ((col > 0 && row < lastRow) &&
      (map[row][col-1] == '#' && map[row+1][col] == '#') &&
      ((col == lastCol || map[row][col+1] != '#') && (row == 0 || map[row-1][col] != '#'))) {
    return 'wall_trc';
  }
  else if ((col < lastCol && row > 0) &&
      (map[row][col+1] == '#' && map[row-1][col] == '#') &&
      ((col == 0 || map[row][col-1] != '#') && (row == lastRow || map[row+1][col] != '#'))) {
    return 'wall_blc';
  }
  else if ((col > 0 && row > 0) &&
      (map[row][col-1] == '#' && map[row-1][col] == '#') &&
      ((col == lastCol || map[row][col+1] != '#') && (row == lastRow || map[row+1][col] != '#'))) {
    return 'wall_brc';
  }
  else if ((row < lastRow) &&
      (map[row+1][col] == '#') &&
      ((row == 0 || map[row-1][col] != '#') && (col == 0 || map[row][col-1] != '#') && (col == lastCol || map[row][col+1] != '#'))) {
    return 'wall_t';
  }
  else if ((row > 0) &&
      (map[row-1][col] == '#') &&
      ((row == lastRow || map[row+1][col] != '#') && (col == 0 || map[row][col-1] != '#') && (col == lastCol || map[row][col+1] != '#'))) {
    return 'wall_b';
  }
  else if ((col < lastCol) &&
      (map[row][col+1] == '#') &&
      ((col == 0 || map[row][col-1] != '#') && (row == 0 || map[row-1][col] != '#') && (row == lastRow || map[row+1][col] != '#'))) {
    return 'wall_l';
  }
  else if ((col > 0) &&
      (map[row][col-1] == '#') &&
      ((col == lastCol || map[row][col+1] != '#') && (row == 0 || map[row-1][col] != '#') && (row == lastRow || map[row+1][col] != '#'))) {
    return 'wall_r';
  }
  else if ((col > 0 && col < lastCol && row < lastRow) &&
      (map[row][col-1] == '#' && map[row][col+1] == '#' && map[row+1][col] == '#') &&
      (row == 0 || map[row-1][col] != '#')) {
    return 'wall_mt';
  }
  else if ((col > 0 && col < lastCol && row > 0) &&
      (map[row][col-1] == '#' && map[row][col+1] == '#' && map[row-1][col] == '#') &&
      (row == lastRow || map[row+1][col] != '#')) {
    return 'wall_mb';
  }
  else if ((row > 0 && row < lastRow && col < lastCol) &&
      (map[row-1][col] == '#' && map[row+1][col] == '#' && map[row][col+1] == '#') &&
      (col == 0 || map[row][col-1] != '#')) {
    return 'wall_ml';
  }
  else if ((row > 0 && row < lastRow && col > 0) &&
      (map[row-1][col] == '#' && map[row+1][col] == '#' && map[row][col-1] == '#') &&
      (col == lastCol || map[row][col+1] != '#')) {
    return 'wall_mr';
  }

  return null;
};

// Повертає масив стін
PlayScene.prototype.getWalls = function () {
  return this._walls;
};

// Повертає масив кульок
PlayScene.prototype.getPellets = function () {
  return this._pellets;
};

// Видаляє кульку зі сцени
PlayScene.prototype.removePellet = function (pellet) {
  for (var i = 0; i < this._pellets.length; ++i) {
    if (this._pellets[i] === pellet) {
      this._pellets.splice(i, 1);
      return;
    }
  }
};

// Повертає об'єкт воріт (Gate)
PlayScene.prototype.getGate = function () {
  return this._gate;
};

/**
 * Ghost Lair — це клітинка під воротами, куди повертаються привиди для відродження.
 */
PlayScene.prototype.getLairPosition = function () {
  return this._lairPosition;
};

// Повертає масив привидів
PlayScene.prototype.getGhosts = function () {
  return this._ghosts;
};

// Повертає поточний рівень
PlayScene.prototype.getCurrentLevel = function () {
  return this._currentLevel;
};

// Перехід на наступний рівень
PlayScene.prototype.nextLevel = function () {
  this._currentLevel++;
  if ((this._currentLevel - 1) >= this._maps.length) {
    this._game.setScene(new StartupScene(this._game));
    return;
  }
  this.loadMap(this._getMapForCurrentLevel());
  this._readyMessage.show();
};

// Встановлює значення очок за поїдання привида
PlayScene.prototype.setGhostScoreValue = function (value) {
  this._ghostScoreValue = value;
  this._previousEatenGhostScoreValue = 0;
};

// Додає очки за поїдання привида
PlayScene.prototype.addScoreForEatenGhost = function (ghost) {
  var amount = this._previousEatenGhostScoreValue == 0 ? this._ghostScoreValue : this._previousEatenGhostScoreValue * 2;
  this.increaseScore(amount);
  this._previousEatenGhostScoreValue = amount;

  this._pointsMessage.setEatenGhost(ghost);
  this._pointsMessage.setValue(amount);
  this._pointsMessage.setPosition(this._pacman.getPosition());
  this._pointsMessage.show();
};

// Повертає поточний рахунок
PlayScene.prototype.getScore = function () {
  return this._score;
};

// Збільшує рахунок на вказану кількість очок
PlayScene.prototype.increaseScore = function (amount) {
  this._score += amount;
};

// Повертає об'єкт PointsMessage
PlayScene.prototype.getPointsMessage = function () {
  return this._pointsMessage;
};

// Розміщує всіх привидів у стартові позиції
PlayScene.prototype.placeGhostsToStartPositions = function () {
  for (var ghost in this._ghosts) {
    this._ghosts[ghost].placeToStartPosition();
  }
};

// Робить всіх привидів вразливими
PlayScene.prototype.makeGhostsVulnerable = function () {
  this._previousEatenGhostScoreValue = 0;
  for (var ghost in this._ghosts) {
    this._ghosts[ghost].makeVulnerable();
  }
};

// Повертає ширину сцени
PlayScene.prototype.getWidth = function () {
  return this._mapCols * TILE_SIZE;
};

// Повертає висоту сцени
PlayScene.prototype.getHeight = function () {
  return this._mapRows * TILE_SIZE;
};

// Повертає ліву межу сцени
PlayScene.prototype.getLeft = function () {
  return 0;
};

// Повертає праву межу сцени
PlayScene.prototype.getRight = function () {
  return this.getWidth() - 1;
};

// Повертає верхню межу сцени
PlayScene.prototype.getTop = function () {
  return 0;
};

// Повертає нижню межу сцени
PlayScene.prototype.getBottom = function () {
  return this.getHeight() - 1;
};

// Повертає об'єкт паузи після смерті Pacman
PlayScene.prototype.getPacmanDiesPause = function () {
  return this._pacmanDiesPause;
};

// Ховає всіх привидів
PlayScene.prototype.hideGhosts = function () {
  for (var i in this._ghosts) {
    this._ghosts[i].setVisible(false);
  }
};

// Показує всіх привидів
PlayScene.prototype.showGhosts = function () {
  for (var i in this._ghosts) {
    this._ghosts[i].setVisible(true);
  }
};

// Повертає об'єкт Cherry
PlayScene.prototype.getCherry = function () {
  return this._cherry;
};

// Повертає карту для поточного рівня
PlayScene.prototype._getMapForCurrentLevel = function () {
  return this._maps[this._currentLevel - 1];
};

// Повертає масив карт за замовчуванням
PlayScene.prototype._getDefaultMaps = function () {
  return [
   // Level 1
   ['###########################',
    '#............#............#',
    '#.####.#####.#.#####.####.#',
    '#O#  #.#   #.#.#   #.#  #O#',
    '#.####.#####.#.#####.####.#',
    '#.........................#',
    '#.######.#.#####.#.######.#',
    '#........#...#...#........#',
    '########.### # ###.########',
    '       #.#   1   #.#       ',
    '########.# ##-## #.########',
    '        .  #234#  .        ',
    '########.# ##### #.########',
    '       #.#       #.#       ',
    '########.# ##### #.########',
    '#............#............#',
    '#.###.######.#.######.###.#',
    '#O..#........C........#..O#',
    '###.#.#.###########.#.#.###',
    '#.....#......#......#.....#',
    '#.##########.#.##########.#',
    '#.........................#',
    '###########################'],
  
   // Level 2
   ['#############.#############',
    '#..........O#.#O..........#',
    '#.####.######.######.####.#',
    '#.........................#',
    '#.####.######.######.####.#',
    '#.#.........#.#.........#.#',
    '#.#.#######.#.#.#######.#.#',
    '#.#.........#.#.........#.#',
    '#.######.####.####.######.#',
    '#........#   1   #........#',
    '####.##### ##-## #####.####',
    '.......... #234# ..........',
    '####.##### ##### #####.####',
    '#........#       #........#',
    '#.#.####.####.####.####.#.#',
    '#.#.#  #....#.#....#  #.#.#',
    '#.#.####.##.#.#.##.####.#.#',
    '#.#.........#C#.........#.#',
    '#.#####.#####.#####.#####.#',
    '#.........................#',
    '#.#####.#####.#####.#####.#',
    '#..........O#.#O..........#',
    '#############.#############'],
  
   // Level 3
   ['######### ### ### #########',
    '#.......# #.# #.# #.......#',
    '#.#####.###.###.###.#####.#',
    '#....O#.............#O....#',
    '#.#####.###########.#####.#',
    '#.#...#.#         #.#...#.#',
    '#.#.#...###########...#.#.#',
    '#.#####.............#####.#',
    '#.....#.##### #####.#.....#',
    '#.###...#..  1  ..#...###.#',
    '#.# #.#.##.##-##.##.#.# #.#',
    '#.###.#....#234#....#.###.#',
    '#.....####.#####.####.....#',
    '#.###.#..         ..#.###.#',
    '#.# #.#.###########.#.# #.#',
    '#.###.#.#         #.#.###.#',
    '#.......#   ###   #.......#',
    '#.###.#.#####C#####.#.###.#',
    '#.# #.#.............#.# #.#',
    '#.###.#.#####.#####.#.###.#',
    '#....O#.....#.#.....#O....#',
    '###########.....###########',
    '          #######          ']
  ];
};

// Повертає шлях до лігва для привида (A* пошук)
PlayScene.prototype.getWaypointsToLairForGhost = function (ghost) {
  var result = [];
  var from = [this.pxToCoord(ghost.getX()), this.pxToCoord(ghost.getY())];
  var to = [this.pxToCoord(this._lairPosition.x), this.pxToCoord(this._lairPosition.y)];
  var wayPoints = AStar(this._getGrid(), from, to);
  for (var wp in wayPoints) {
    result.push(new Position(wayPoints[wp][0] * TILE_SIZE, wayPoints[wp][1] * TILE_SIZE));
  }
  return result;
};

// Повертає сітку для алгоритму пошуку шляху
PlayScene.prototype._getGrid = function () {
  var result = this._getEmptyGrid();
  for (var i = 0; i < this._walls.length; ++i) {
    var row = this.pxToCoord(this._walls[i].getY());
    var col = this.pxToCoord(this._walls[i].getX());
    result[row][col] = 1;
  }
  return result;
};

// Перетворює пікселі у координати сітки
PlayScene.prototype.pxToCoord = function (px) {
  return Math.floor(px / TILE_SIZE);
};

// Повертає порожню сітку для пошуку шляху
PlayScene.prototype._getEmptyGrid = function () {
  var result = [];
  for (var r = 0; r < this._mapRows; ++r) {
    var row = [];
    for (var c = 0; c < this._mapCols; ++c) {
      row.push(0);
    }
    result.push(row);
  }
  return result;
};

// Повертає стіну за координатами сітки
PlayScene.prototype.getWallAtTile = function (col, row) {
  var position = new Position(col * TILE_SIZE, row * TILE_SIZE);
  for (var wall in this._walls) {
    if (this._walls[wall].getPosition().equals(position)) {
      return this._walls[wall];
    }
  }
  return null;
};

// Перевіряє, чи гра на паузі (READY, очки, смерть Pacman)
PlayScene.prototype.isPause = function () {
  return this._readyMessage.isVisible() ||
    this._pointsMessage.isVisible() ||
    this._pacmanDiesPause.isActive();
};
