// Клас Gate відповідає за ворота у лігво привидів
var GATE_HEIGHT = TILE_SIZE / 4;

// Конструктор воріт
function Gate(scene) {
  this._scene = scene; // Посилання на сцену
  this._rect = new Rect({x: 0, y: 0, w: TILE_SIZE, h: GATE_HEIGHT}); // Прямокутник воріт
}

// Повертає прямокутник воріт
Gate.prototype.getRect = function () {
  return this._rect;
};

// Малює ворота на сцені
Gate.prototype.draw = function (ctx) {
  var x = this._scene.getX() + this.getX();
  var y = this._scene.getY() + this.getY();
  
  ctx.fillStyle = "#ffb8de";
  ctx.fillRect(x, y, this.getWidth(), this.getHeight());
};


/*--------------------------- Делегування методів Rect --------------------------------*/

// Встановлює позицію воріт
Gate.prototype.setPosition = function (position) {
  this._rect.setPosition(position);
};

// Повертає позицію воріт
Gate.prototype.getPosition = function () {
  return this._rect.getPosition();
};

// Повертає координату X воріт
Gate.prototype.getX = function () {
  return this._rect.getX();
};

// Повертає координату Y воріт
Gate.prototype.getY = function () {
  return this._rect.getY();
};

// Повертає ліву межу воріт
Gate.prototype.getLeft = function () {
  return this._rect.getLeft();
};

// Повертає праву межу воріт
Gate.prototype.getRight = function () {
  return this._rect.getRight();
};

// Повертає верхню межу воріт
Gate.prototype.getTop = function () {
  return this._rect.getTop();
};

// Повертає нижню межу воріт
Gate.prototype.getBottom = function () {
  return this._rect.getBottom();
};

// Повертає ширину воріт
Gate.prototype.getWidth = function () {
  return this._rect.getWidth();
};

// Повертає висоту воріт
Gate.prototype.getHeight = function () {
  return this._rect.getHeight();
};
