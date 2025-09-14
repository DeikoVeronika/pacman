// Клас Pellet відповідає за маленьку кульку, яку їсть Pac-Man
var PELLET_SIZE = 2;
var PELLET_POSITION_CORRECTION = 7;

// Конструктор. Створює кульку на сцені.
function Pellet(scene) {
  this._scene = scene; // Посилання на сцену
  this._rect = new Rect({x: 0, y: 0, w: PELLET_SIZE, h: PELLET_SIZE}); // Прямокутник для позиції та розміру
}

// Повертає прямокутник кульки
Pellet.prototype.getRect = function () {
  return this._rect;
};

// Повертає кількість очок за цю кульку
Pellet.prototype.getValue = function () {
  return 10;
};

// Малює кульку на canvas
Pellet.prototype.draw = function (ctx) {
  var x = this._scene.getX() + this.getX() - PELLET_POSITION_CORRECTION;
  var y = this._scene.getY() + this.getY() - PELLET_POSITION_CORRECTION;
  ctx.drawImage(ImageManager.getImage('pellet'), x, y);
};


/*--------------------------- Делегування методів Rect --------------------------------*/

// Встановлює позицію кульки
Pellet.prototype.setPosition = function (position) {
  position.x += PELLET_POSITION_CORRECTION;
  position.y += PELLET_POSITION_CORRECTION;
  this._rect.setPosition(position);
};

// Повертає позицію кульки
Pellet.prototype.getPosition = function () {
  return this._rect.getPosition();
};

// Повертає координату X кульки
Pellet.prototype.getX = function () {
  return this._rect.getX();
};

// Повертає координату Y кульки
Pellet.prototype.getY = function () {
  return this._rect.getY();
};

// Повертає ліву межу кульки
Pellet.prototype.getLeft = function () {
  return this._rect.getLeft();
};

// Повертає праву межу кульки
Pellet.prototype.getRight = function () {
  return this._rect.getRight();
};

// Повертає верхню межу кульки
Pellet.prototype.getTop = function () {
  return this._rect.getTop();
};

// Повертає нижню межу кульки
Pellet.prototype.getBottom = function () {
  return this._rect.getBottom();
};

// Повертає ширину кульки
Pellet.prototype.getWidth = function () {
  return this._rect.getWidth();
};

// Повертає висоту кульки
Pellet.prototype.getHeight = function () {
  return this._rect.getHeight();
};
