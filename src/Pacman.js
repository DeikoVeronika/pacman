// Оголошення ігрових подій для Pacman
var EVENT_PELLET_EATEN = 'EVENT_PELLET_EATEN';                // Подія: з'їдена маленька кулька
var EVENT_POWER_PELLET_EATEN = 'EVENT_POWER_PELLET_EATEN';    // Подія: з'їдена велика кулька
var EVENT_GHOST_EATEN = 'EVENT_GHOST_EATEN';                  // Подія: з'їдений привид
var EVENT_CHERRY_EATEN = 'EVENT_CHERRY_EATEN';                // Подія: з'їдена вишня
var EVENT_PACMAN_DIES_ANIMATION_STARTED = 'EVENT_PACMAN_DIES_ANIMATION_STARTED'; // Подія: початок анімації смерті Pacman

// Клас Pacman відповідає за логіку Pacman: рух, зіткнення, анімації, життя
function Pacman(scene, game) {
  this._scene = scene; // Посилання на сцену
  this._game = game;   // Посилання на гру
  this._sprite = new Sprite(scene); // Спрайт Pacman
  this._sprite.setRect(new Rect({x: 0, y: 0, w: TILE_SIZE, h: TILE_SIZE}));
  this._visible = true; // Чи видимий Pacman
  
  // Масив кадрів анімації руху
  this._frames = [1,2,3,2];
  this._frame = 0;
  
  // Масив кадрів анімації смерті
  this._deathFrames = [1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,11,11,12,12,12,12];
  this._resetDeathFrame();
  this._playDiesAnimation = true; // Чи відтворювати анімацію смерті
  
  this._livesCount = 2; // Кількість життів
  this._eatenPelletSound = 'pellet1'; // Звук поїдання кульки
}

// Встановлює кількість життів
Pacman.prototype.setLivesCount = function (lives) {
  this._livesCount = lives;
};

// Повертає кількість життів
Pacman.prototype.getLivesCount = function () {
  return this._livesCount;
};

// Встановлює видимість Pacman
Pacman.prototype.setVisible = function (value) {
  this._visible = value;
};

// Перевіряє, чи Pacman видимий
Pacman.prototype.isVisible = function () {
  return this._visible;
};

// Встановлює поточний кадр анімації
Pacman.prototype.setFrame = function (frame) {
  this._frame = frame;
};

// Запитує зміну напрямку руху (якщо немає стіни)
Pacman.prototype.requestNewDirection = function (direction) {
  if (this._sprite.willCollideWithWallIfMovedInDirection(direction)) {
    return;
  }
  this._sprite.setDirection(direction);
  this._sprite.setCurrentSpeed(this._sprite.getSpeed());
};

// Встановлює стратегію поведінки Pacman (рух, смерть тощо)
Pacman.prototype.setStrategy = function (strategy) {
  this._strategy = strategy;
};

// Оновлює стан Pacman (делегує стратегії)
Pacman.prototype.tick = function () {
  this._strategy.tick();

    // Перевіряємо, чи залишилися крапки на рівні
  if (this._scene.getPellets().length === 0) {
    this._scene.nextLevel(); // Якщо крапок немає, переходимо на наступний рівень
  }
};

// Змінює кадр анімації руху
Pacman.prototype.advanceFrame = function () {
  this._frame++;
  if (this._frame >= this._frames.length) {
    this._frame = 0;
  }
};

// Рухається у поточному напрямку
Pacman.prototype.move = function () {
  this._sprite.move(this._sprite.getDirection());
};

// Перевіряє вихід за межі карти
Pacman.prototype.checkIfOutOfMapBounds = function () {
  this._sprite.checkIfOutOfMapBounds();
};

// Обробляє натискання клавіш для зміни напрямку руху
Pacman.prototype.keyPressed = function (key) {
  if (key == KEY_RIGHT) {
    this.requestNewDirection(DIRECTION_RIGHT);
  }
  else if (key == KEY_LEFT) {
    this.requestNewDirection(DIRECTION_LEFT);
  }
  else if (key == KEY_UP) {
    this.requestNewDirection(DIRECTION_UP);
  }
  else if (key == KEY_DOWN) {
    this.requestNewDirection(DIRECTION_DOWN);
  }
};

// Обробляє зіткнення зі стінами
Pacman.prototype.handleCollisionsWithWalls = function () {
  var touchedWall = this._sprite.getTouchedWall();
  if (touchedWall != null) {
    this._sprite.resolveCollisionWithWall(touchedWall);
    this._sprite.setCurrentSpeed(0);
  }
};

// Обробляє зіткнення з кульками (маленькі та великі)
Pacman.prototype.handleCollisionsWithPellets = function () {
  var pellets = this._scene.getPellets();
  for (var pellet in pellets) {
    if (this._sprite.collidedWith(pellets[pellet])) {
      this._scene.increaseScore(pellets[pellet].getValue());
      
      if (pellets[pellet] instanceof PowerPellet) {
        this._scene.makeGhostsVulnerable();
        this._game.getEventManager().fireEvent({'name': EVENT_POWER_PELLET_EATEN});
      }
      else { // Звичайна кулька
        this._switchEatenPelletSound();
        this._game.getEventManager().fireEvent({'name': EVENT_PELLET_EATEN, 'pacman': this});
      }
      
      this._scene.removePellet(pellets[pellet]);
      if (this._scene.getPellets().length == 0) {
        this._scene.nextLevel();
      }
      return;
    }
  }
};

// Перемикає звук поїдання маленької кульки
Pacman.prototype._switchEatenPelletSound = function () {
  this._eatenPelletSound = this._eatenPelletSound == 'pellet1' ? 'pellet2' : 'pellet1';
};

// Повертає поточний звук поїдання кульки
Pacman.prototype.getEatenPelletSound = function () {
  return this._eatenPelletSound;
};

// Обробляє зіткнення з привидами
Pacman.prototype.handleCollisionsWithGhosts = function () {
  var ghosts = this._scene.getGhosts();
  for (var i in ghosts) {
    var ghost = ghosts[i];
    if (this._sprite.collidedWith(ghost)) {
      if (ghost.getState() == GHOST_STATE_NORMAL) {
        this._scene.getPacmanDiesPause().activate();
        return;
      }
      else if (ghost.getState() == GHOST_STATE_VULNERABLE) {
        this._game.getEventManager().fireEvent({'name': EVENT_GHOST_EATEN});
        ghost.runHome();
        this._scene.addScoreForEatenGhost(ghost);
      }
    }
  }
};

// Обробляє зіткнення з вишнею
Pacman.prototype.handleCollisionsWithCherry = function () {
  var cherry = this._scene.getCherry();
  if (!cherry.isVisible() || cherry.isEaten()) {
    return;
  }
  if (this._sprite.collidedWith(cherry)) {
    cherry.eat();
    this._scene.increaseScore(CHERRY_VALUE);
    this._game.getEventManager().fireEvent({'name': EVENT_CHERRY_EATEN});
  }
};

// Малює Pacman на сцені
Pacman.prototype.draw = function (ctx) {
  if (!this._visible) {
    return;
  }
  
  var x = this._scene.getX() + this.getX();
  var y = this._scene.getY() + this.getY();
  ctx.drawImage(ImageManager.getImage(this.getCurrentFrame()), x, y);
};

// Повертає ім'я поточного кадру для малювання
Pacman.prototype.getCurrentFrame = function () {
  if (this._strategy instanceof PacmanDiesStrategy) {
    return 'pacman_dies_' + this._deathFrames[this._deathFrame];
  }
  else {
    var index = this._frames[this._frame];
    var direction = index > 1 ? this.getDirection() : '';
    return 'pacman_' + index + direction;
  }
};

// Повертає поточний кадр анімації смерті
Pacman.prototype.getDeathFrame = function () {
  return this._deathFrame;
};

// Змінює кадр анімації смерті
Pacman.prototype.advanceDeathFrame = function () {
  this._deathFrame++;
};

// Пропускає анімацію смерті
Pacman.prototype.skipDiesAnimation = function () {
  this._playDiesAnimation = false;
};

// Вмикає анімацію смерті
Pacman.prototype.playDiesAnimation = function () {
  this._playDiesAnimation = true;
};

// Перевіряє, чи завершена анімація смерті
Pacman.prototype.isDiesAnimationCompleted = function () {
  return this._deathFrame >= this._deathFrames.length;
};

// Перевіряє, чи потрібно пропустити анімацію смерті
Pacman.prototype.shouldSkipDiesAnimation = function () {
  return !this._playDiesAnimation;
};

// Скидає лічильник кадрів смерті
Pacman.prototype._resetDeathFrame = function () {
  this._deathFrame = -1;
};

// Викликається після завершення анімації смерті
Pacman.prototype.diesAnimationCompleted = function () {
  // Перевіряємо, чи це було останнє життя
  if (this._livesCount == 0) {
    localStorage.setItem('lastPacmanScore', this._scene.getScore());
    window.location.reload();
    return;
  }

  // Цей код виконується, якщо життя ще залишилися
  this.setStrategy(new PacmanPlaySceneStrategy(this, this._scene));
  this._livesCount--;
  this._scene.getReadyMessage().setVisibilityDuration(READY_MESSAGE_DURATION_SHORT);
  this._scene.getReadyMessage().show();
  this._scene.getCherry().hide();
  this._scene.showGhosts();
  this.placeToStartPosition();
  this._frame = 0;
  this._resetDeathFrame();
  this._scene.placeGhostsToStartPositions();
};


/*--------------------------- Делегування методів Sprite --------------------------------*/

// Повертає прямокутник Pacman
Pacman.prototype.getRect = function () {
  return this._sprite.getRect();
};

// Встановлює напрямок руху Pacman
Pacman.prototype.setDirection = function (direction) {
  this._sprite.setDirection(direction);
};

// Повертає напрямок руху Pacman
Pacman.prototype.getDirection = function () {
  return this._sprite.getDirection();
};

// Встановлює поточну швидкість Pacman
Pacman.prototype.setCurrentSpeed = function (speed) {
  this._sprite.setCurrentSpeed(speed);
};

// Встановлює максимальну швидкість Pacman
Pacman.prototype.setSpeed = function (speed) {
  this._sprite.setSpeed(speed);
};

// Повертає поточну швидкість Pacman
Pacman.prototype.getCurrentSpeed = function () {
  return this._sprite.getCurrentSpeed();
};

// Встановлює позицію Pacman
Pacman.prototype.setPosition = function (position) {
  this._sprite.setPosition(position);
};

// Повертає позицію Pacman
Pacman.prototype.getPosition = function () {
  return this._sprite.getPosition();
};

// Повертає координату X Pacman
Pacman.prototype.getX = function () {
  return this._sprite.getX();
};

// Повертає координату Y Pacman
Pacman.prototype.getY = function () {
  return this._sprite.getY();
};

// Повертає ліву межу Pacman
Pacman.prototype.getLeft = function () {
  return this._sprite.getLeft();
};

// Повертає праву межу Pacman
Pacman.prototype.getRight = function () {
  return this._sprite.getRight();
};

// Повертає верхню межу Pacman
Pacman.prototype.getTop = function () {
  return this._sprite.getTop();
};

// Повертає нижню межу Pacman
Pacman.prototype.getBottom = function () {
  return this._sprite.getBottom();
};

// Повертає ширину Pacman
Pacman.prototype.getWidth = function () {
  return this._sprite.getWidth();
};

// Повертає висоту Pacman
Pacman.prototype.getHeight = function () {
  return this._sprite.getHeight();
};

// Встановлює стартову позицію Pacman
Pacman.prototype.setStartPosition = function (position) {
  this._sprite.setStartPosition(position);
};

// Повертає стартову позицію Pacman
Pacman.prototype.getStartPosition = function () {
  return this._sprite.getStartPosition();
};

// Переміщує Pacman у стартову позицію
Pacman.prototype.placeToStartPosition = function () {
  this._sprite.placeToStartPosition();
};
