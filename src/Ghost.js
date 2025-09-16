var GHOST_BLINKY = 'blinky';
var GHOST_PINKY = 'pinky';
var GHOST_INKY = 'inky';
var GHOST_CLYDE = 'clyde';

var GHOST_STATE_NORMAL = 'normal';
var GHOST_STATE_VULNERABLE = 'vulnerable';
var GHOST_STATE_RUN_HOME = 'run_home';

var GHOST_SPEED_FAST = 8;
var GHOST_SPEED_NORMAL = 4;
var GHOST_SPEED_SLOW = 2;

function Ghost(name, scene) {
  this._name = name;
  this._scene = scene;
  this._sprite = new Sprite(scene);
  this._sprite.setRect(new Rect({x: 0, y: 0, w: TILE_SIZE, h: TILE_SIZE}));
  this.setCurrentSpeed(GHOST_SPEED_NORMAL);
  this._state = GHOST_STATE_NORMAL;
  this._visible = true;

  this.setDirection(DIRECTION_UP); 

  this._bodyFrames = [1,2];
  this._bodyFrame = 0;

  this._vulnerabilityDuration = 150;
  this._flashingDuration = 50;
  this._blinkDuration = 7;
  this._blinkTimer = 0;
  this._vulnerableTimeLeft = 0;
  this._blink = false;
}

Ghost.prototype.getName = function () {
  return this._name;
};

Ghost.prototype.setVisible = function (value) {
  this._visible = value;
};

Ghost.prototype.isVisible = function () {
  return this._visible;
};

Ghost.prototype.tick = function () {
  if (this._scene.isPause()) {
    return;
  }
  
  this._advanceBodyFrame();
  
  if (this._state == GHOST_STATE_VULNERABLE) {
    this._advanceVulnerableStateTimers();
    if (this._vulnerableTimeLeft == 0) {
      this.makeNormal();
    }
  }
  
  if (this._state == GHOST_STATE_RUN_HOME) {
    // Логіка повернення додому залишається без змін
    if (this.getPosition().equals(this._scene.getLairPosition())) {
      this.makeNormal();
      this._sprite.setDirection(DIRECTION_UP);
      return;
    }
    if (this.getPosition().equals(this._currentWaypoint)) {
      this._currentWaypoint = this._wayPoints.shift();
      this._setDirectionToCurrentWaypoint();
    }
  } else {
    // ОСНОВНА ЗМІНА: викликаємо нову функцію для прийняття рішень
    this._makeDecision();
  }

  this._sprite.move(this.getDirection());
  this._sprite.checkIfOutOfMapBounds();
  this._handleCollisionsWithWalls();
};

Ghost.prototype._advanceBodyFrame = function () {
  this._bodyFrame++;
  if (this._bodyFrame >= this._bodyFrames.length) {
    this._bodyFrame = 0;
  }
};

Ghost.prototype._setDirectionToCurrentWaypoint = function () {
  if (this._currentWaypoint.x == this.getX()) {
    this._sprite.setDirection(this._currentWaypoint.y > this.getY() ? DIRECTION_DOWN : DIRECTION_UP);
  } else {
    this._sprite.setDirection(this._currentWaypoint.x > this.getX() ? DIRECTION_RIGHT : DIRECTION_LEFT);
  }
};

// ===================================================================
// НОВА ЛОГІКА AI
// ===================================================================

/**
 * Головна функція прийняття рішень, яка викликається в tick()
 */
Ghost.prototype._makeDecision = function () {
    // Привиди приймають рішення тільки на перехрестях (коли можуть повернути)
    if (!this._canTurn()) {
        return;
    }

    var targetTile = this._getTargetTile();
    var possibleTurns = this._getPossibleTurns();
    
    // Якщо можливих поворотів немає, нічого не робимо
    if (possibleTurns.length === 0) {
        return;
    }

    var bestTurn = this._getBestTurn(possibleTurns, targetTile);
    this.setDirection(bestTurn);
};

/**
 * Визначає, чи може привид повернути в даний момент.
 * Це відбувається, коли він ідеально вирівняний з сіткою.
 */
Ghost.prototype._canTurn = function() {
    return this.getX() % TILE_SIZE === 0 && this.getY() % TILE_SIZE === 0;
};

// Визначає цільову клітинку (куди рухатись) залежно від імені привида та рівня складності.

Ghost.prototype._getTargetTile = function () {
    var pacman = this._scene.getPacman();
    
    // EASY LEVEL: all move randomly
    if (gameDifficulty === 'easy') {
        // FIXED: Call getWidth() and getHeight() directly on the scene
        return new Position(getRandomInt(0, this._scene.getWidth()), getRandomInt(0, this._scene.getHeight()));
    }

    // NORMAL & HARD LEVELS
    switch (this.getName()) {
        case GHOST_BLINKY:
            return pacman.getPosition(); // Always targets Pac-Man

        case GHOST_PINKY:
            // Active on Normal and Hard
            if (gameDifficulty === 'normal' || gameDifficulty === 'hard') {
                var target = new Position(pacman.getX(), pacman.getY());
                // Targets 4 tiles ahead of Pac-Man
                switch (pacman.getDirection()) {
                    case DIRECTION_UP:    target.y -= 4 * TILE_SIZE; break;
                    case DIRECTION_DOWN:  target.y += 4 * TILE_SIZE; break;
                    case DIRECTION_LEFT:  target.x -= 4 * TILE_SIZE; break;
                    case DIRECTION_RIGHT: target.x += 4 * TILE_SIZE; break;
                }
                return target;
            }
            break; // If not active, will fall through to random movement

        case GHOST_INKY:
            // Active only on Hard
            if (gameDifficulty === 'hard') {
                var blinky = this._scene.getGhost(GHOST_BLINKY);
                var pacmanAhead = new Position(pacman.getX(), pacman.getY());
                // Position 2 tiles ahead of Pac-Man
                 switch (pacman.getDirection()) {
                    case DIRECTION_UP:    pacmanAhead.y -= 2 * TILE_SIZE; break;
                    case DIRECTION_DOWN:  pacmanAhead.y += 2 * TILE_SIZE; break;
                    case DIRECTION_LEFT:  pacmanAhead.x -= 2 * TILE_SIZE; break;
                    case DIRECTION_RIGHT: pacmanAhead.x += 2 * TILE_SIZE; break;
                }
                // Vector from Blinky to the point ahead of Pac-Man, doubled
                return new Position(
                    pacmanAhead.x + (pacmanAhead.x - blinky.getX()),
                    pacmanAhead.y + (pacmanAhead.y - blinky.getY())
                );
            }
            break;

        case GHOST_CLYDE:
            // Active only on Hard
            if (gameDifficulty === 'hard') {
                var distance = this.getPosition().getDistance(pacman.getPosition());
                // If Pac-Man is far away (more than 8 tiles), chase him
                if (distance > 8 * TILE_SIZE) {
                    return pacman.getPosition();
                } else {
                    // If close - run to the bottom left corner
                    // FIXED: Call getHeight() directly on the scene
                    return new Position(0, this._scene.getHeight());
                }
            }
            break;
    }

    // Default (for inactive ghosts) - random movement
    // FIXED: Call getWidth() and getHeight() directly on the scene
    return new Position(getRandomInt(0, this._scene.getWidth()), getRandomInt(0, this._scene.getHeight()));
};

/**
 * Обирає найкращий поворот із можливих, щоб наблизитись до цілі.
 */
Ghost.prototype._getBestTurn = function (possibleTurns, targetTile) {
    var bestTurn = -1;
    var minDistance = Infinity;

    for (var i = 0; i < possibleTurns.length; i++) {
        var turn = possibleTurns[i];
        var nextPos = new Position(this.getX(), this.getY());
        
        // Розраховуємо наступну позицію для кожного можливого повороту
        if (turn === DIRECTION_UP) nextPos.y -= TILE_SIZE;
        if (turn === DIRECTION_DOWN) nextPos.y += TILE_SIZE;
        if (turn === DIRECTION_LEFT) nextPos.x -= TILE_SIZE;
        if (turn === DIRECTION_RIGHT) nextPos.x += TILE_SIZE;
        
        var dx = nextPos.x - targetTile.x;
        var dy = nextPos.y - targetTile.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
            minDistance = distance;
            bestTurn = turn;
        }
    }
    return bestTurn;
};

/**
 * Повертає список можливих напрямків руху (не в стіну і не назад).
 */
Ghost.prototype._getPossibleTurns = function () {
    var possibleTurns = [];
    var directions = [DIRECTION_UP, DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT];
    var oppositeDirection = this._getOppositeDirection(this.getDirection());

    for (var i = 0; i < directions.length; i++) {
        var direction = directions[i];
        // Привиди не можуть розвернутися на 180 градусів
        if (direction === oppositeDirection) {
            continue;
        }
        if (!this._sprite.willCollideWithWallIfMovedInDirection(direction)) {
            possibleTurns.push(direction);
        }
    }
    return possibleTurns;
};

/**
 * Допоміжна функція для визначення протилежного напрямку.
 */
Ghost.prototype._getOppositeDirection = function (direction) {
    if (direction === DIRECTION_UP) return DIRECTION_DOWN;
    if (direction === DIRECTION_DOWN) return DIRECTION_UP;
    if (direction === DIRECTION_LEFT) return DIRECTION_RIGHT;
    if (direction === DIRECTION_RIGHT) return DIRECTION_LEFT;
    return -1;
};

// ===================================================================
// КІНЕЦЬ НОВОЇ ЛОГІКИ AI
// ===================================================================

Ghost.prototype._handleCollisionsWithWalls = function () {
  var touchedWall = this._sprite.getTouchedWall();
  if (touchedWall != null) {
    this._sprite.resolveCollisionWithWall(touchedWall);
  }
};

Ghost.prototype.getState = function () {
  return this._state;
};

Ghost.prototype.makeNormal = function () {
  this._state = GHOST_STATE_NORMAL;
  this.setCurrentSpeed(GHOST_SPEED_NORMAL);
  this._blink = false;
};

Ghost.prototype.setVulnerabilityDuration = function (duration) {
  this._vulnerabilityDuration = duration;
};

Ghost.prototype.setFlashingDuration = function (duration) {
  this._flashingDuration = duration;
};

Ghost.prototype.setBlinkDuration = function (duration) {
  this._blinkDuration = duration;
};

Ghost.prototype.getVulnerableTimeLeft = function () {
  return this._vulnerableTimeLeft;
};

Ghost.prototype.isBlink = function () {
  return this._blink;
};

Ghost.prototype._advanceVulnerableStateTimers = function () {
  this._vulnerableTimeLeft--;
  
  if (this._flashingDuration == this._vulnerableTimeLeft) {
    this._blink = true;
    this._blinkTimer = 0;
  }
  if (this._vulnerableTimeLeft < this._flashingDuration) {
    this._blinkTimer++;
    if (this._blinkTimer == this._blinkDuration) {
      this._blinkTimer = 0;
      this._blink = !this._blink;
    }
  }
};

Ghost.prototype.makeVulnerable = function () {
    // В уразливому стані привиди рухаються випадково
  if (this._state == GHOST_STATE_NORMAL || this._state == GHOST_STATE_VULNERABLE) {
    this._state = GHOST_STATE_VULNERABLE;
    this.setCurrentSpeed(GHOST_SPEED_SLOW);
    this._vulnerableTimeLeft = this._vulnerabilityDuration;
    this._blink = false;
    // Розвертаємо привида при вразливості
    this.setDirection(this._getOppositeDirection(this.getDirection()));
  }
};

Ghost.prototype.runHome = function () {
  this._state = GHOST_STATE_RUN_HOME;
  this.setCurrentSpeed(GHOST_SPEED_FAST);
  this._wayPoints = this._scene.getWaypointsToLairForGhost(this);
  this._currentWaypoint = this._wayPoints.shift();
  this.setPosition(this._currentWaypoint);
};

Ghost.prototype.draw = function (ctx) {
  if (!this._visible) {
    return;
  }

  var x = this._scene.getX() + this.getX();
  var y = this._scene.getY() + this.getY();

  if (this._state != GHOST_STATE_RUN_HOME) {
    var bodyFrameKey = this.getCurrentBodyFrame();
    ctx.drawImage(ImageManager.getImage(bodyFrameKey), x, y);
  }
  if (this._state != GHOST_STATE_VULNERABLE) {
    ctx.drawImage(ImageManager.getImage(this.getCurrentEyesFrame()), x, y);
  }
};

Ghost.prototype.getCurrentBodyFrame = function () {
  var index = this._bodyFrames[this._bodyFrame];
  var prefix = this._name;
  if (this._state == GHOST_STATE_VULNERABLE) {
    prefix = 'vulnerable';
  }
  var result = prefix + '_' + index;
  if (this._blink) {
    result += 'b';
  }
  return result;
};

Ghost.prototype.getCurrentEyesFrame = function () {
  return 'eyes_' + this.getDirection();
};


/*--------------------------- Sprite delegation --------------------------------*/
// Цей блок залишається без змін

Ghost.prototype.getRect = function () { return this._sprite.getRect(); };
Ghost.prototype.setDirection = function (direction) { return this._sprite.setDirection(direction); };
Ghost.prototype.getDirection = function () { return this._sprite.getDirection(); };
Ghost.prototype.setCurrentSpeed = function (speed) { this._sprite.setCurrentSpeed(speed); };
Ghost.prototype.getCurrentSpeed = function () { return this._sprite.getCurrentSpeed(); };
Ghost.prototype.setPosition = function (position) { this._sprite.setPosition(position); };
Ghost.prototype.getPosition = function () { return this._sprite.getPosition(); };
Ghost.prototype.getX = function () { return this._sprite.getX(); };
Ghost.prototype.getY = function () { return this._sprite.getY(); };
Ghost.prototype.getLeft = function () { return this._sprite.getLeft(); };
Ghost.prototype.getRight = function () { return this._sprite.getRight(); };
Ghost.prototype.getTop = function () { return this._sprite.getTop(); };
Ghost.prototype.getBottom = function () { return this._sprite.getBottom(); };
Ghost.prototype.getWidth = function () { return this._sprite.getWidth(); };
Ghost.prototype.getHeight = function () { return this._sprite.getHeight(); };
Ghost.prototype.setStartPosition = function (position) { this._sprite.setStartPosition(position); };
Ghost.prototype.getStartPosition = function () { return this._sprite.getStartPosition(); };
Ghost.prototype.placeToStartPosition = function () {
  this.makeNormal();
  this._sprite.placeToStartPosition();
};