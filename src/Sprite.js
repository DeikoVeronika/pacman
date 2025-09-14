// Опис напрямків руху спрайта
var DIRECTION_RIGHT = 'r'; // Направо
var DIRECTION_LEFT = 'l';  // Наліво
var DIRECTION_UP = 'u';    // Вгору
var DIRECTION_DOWN = 'd';  // Вниз

// Базовий клас для всіх рухомих об'єктів (спрайтів) на сцені
function Sprite(scene) {
  this._scene = scene; // Посилання на сцену
}

// Встановлює прямокутник (позицію та розмір) спрайта
Sprite.prototype.setRect = function (rect) {
  this._rect = rect;
};

// Повертає прямокутник спрайта
Sprite.prototype.getRect = function () {
  return this._rect;
};

// Встановлює напрямок руху спрайта
Sprite.prototype.setDirection = function (direction) {
  this._direction = direction;
};

// Повертає напрямок руху спрайта
Sprite.prototype.getDirection = function () {
  return this._direction;
};

// Встановлює максимальну швидкість спрайта
Sprite.prototype.setSpeed = function (speed) {
  this._speed = speed;
};

// Повертає максимальну швидкість спрайта
Sprite.prototype.getSpeed = function () {
  return this._speed;
};

// Встановлює поточну швидкість спрайта
Sprite.prototype.setCurrentSpeed = function (speed) {
  this._currentSpeed = speed;
  if (this._currentSpeed > this._speed) {
    throw new Error('Current speed should not be greater than speed');
  }
};

// Повертає поточну швидкість спрайта
Sprite.prototype.getCurrentSpeed = function () {
  return this._currentSpeed;
};

// Переміщує спрайт у заданому напрямку на поточну швидкість
Sprite.prototype.move = function (direction) {
  if (direction == DIRECTION_RIGHT) {
    this._rect.move({x: this._currentSpeed, y: 0});
  }
  else if (direction == DIRECTION_LEFT) {
    this._rect.move({x: -this._currentSpeed, y: 0});
  }
  else if (direction == DIRECTION_UP) {
    this._rect.move({x: 0, y: -this._currentSpeed});
  }
  else if (direction == DIRECTION_DOWN) {
    this._rect.move({x: 0, y: this._currentSpeed});
  }
};

/**
 * Перевіряє, чи вийшов спрайт за межі карти, і переносить його на протилежний бік, якщо потрібно.
 */
Sprite.prototype.checkIfOutOfMapBounds = function () {
  if (this.getRight() > this._scene.getRight()) {
    this.setPosition(new Position(this._scene.getLeft(), this.getY()));
  }
  else if (this.getLeft() < this._scene.getLeft()) {
    this.setPosition(new Position(this._scene.getRight() - this.getWidth() + 1, this.getY()));
  }
  else if (this.getTop() < this._scene.getTop()) {
    this.setPosition(new Position(this.getX(), this._scene.getBottom() - this.getHeight() + 1));
  }
  else if (this.getBottom() > this._scene.getBottom()) {
    this.setPosition(new Position(this.getX(), this._scene.getTop()));
  }
};

// Вирішує колізію зі стіною, відсуваючи спрайт від стіни
Sprite.prototype.resolveCollisionWithWall = function (wall) {
  var moveX = 0;
  var moveY = 0;
  if (this._direction == DIRECTION_RIGHT) {
    moveX = this.getRight() - wall.getLeft() + 1;
  }
  else if (this._direction == DIRECTION_LEFT) {
    moveX = this.getLeft() - wall.getRight() - 1;
  }
  else if (this._direction == DIRECTION_UP) {
    moveY = this.getTop() - wall.getBottom() - 1;
  }
  else if (this._direction == DIRECTION_DOWN) {
    moveY = this.getBottom() - wall.getTop() + 1;
  }
  this._rect.move({x: -moveX, y: -moveY});
};

// Перевіряє, чи буде колізія зі стіною, якщо спрайт рухатиметься у вказаному напрямку
Sprite.prototype.willCollideWithWallIfMovedInDirection = function (direction) {
  var result = false;
  var currentPosition = this.getPosition();
  this.move(direction);
  if (this.getTouchedWall() != null) {
    result = true;
  }
  this.setPosition(currentPosition);
  return result;
};

// Повертає стіну, з якою спрайт зіткнувся (або null, якщо немає колізії)
Sprite.prototype.getTouchedWall = function () {
  var walls = this._scene.getWalls();
  for (var wall in walls) {
    if (this.collidedWith(walls[wall])) {
      return walls[wall];
    }
  }
  return null;
};

// Перевіряє, чи є колізія з іншим об'єктом
Sprite.prototype.collidedWith = function (other) {
  return this._rect.intersectsRect(other.getRect());
};

// Встановлює стартову позицію спрайта
Sprite.prototype.setStartPosition = function (position) {
  this._startPosition = position;
};

// Повертає стартову позицію спрайта
Sprite.prototype.getStartPosition = function () {
  return this._startPosition;
};

// Переміщує спрайт у стартову позицію
Sprite.prototype.placeToStartPosition = function () {
  this.setPosition(this._startPosition);
};


/*--------------------------- Делегування методів Rect --------------------------------*/

// Встановлює позицію спрайта
Sprite.prototype.setPosition = function (position) {
  this._rect.setPosition(position);
};

// Повертає позицію спрайта
Sprite.prototype.getPosition = function () {
  return this._rect.getPosition();
};

// Повертає координату X спрайта
Sprite.prototype.getX = function () {
  return this._rect.getX();
};

// Повертає координату Y спрайта
Sprite.prototype.getY = function () {
  return this._rect.getY();
};

// Повертає ліву межу спрайта
Sprite.prototype.getLeft = function () {
  return this._rect.getLeft();
};

// Повертає праву межу спрайта
Sprite.prototype.getRight = function () {
  return this._rect.getRight();
};

// Повертає верхню межу спрайта
Sprite.prototype.getTop = function () {
  return this._rect.getTop();
};

// Повертає нижню межу спрайта
Sprite.prototype.getBottom = function () {
  return this._rect.getBottom();
};

// Повертає ширину спрайта
Sprite.prototype.getWidth = function () {
  return this._rect.getWidth();
};

// Повертає висоту спрайта
Sprite.prototype.getHeight = function () {
  return this._rect.getHeight();
};
