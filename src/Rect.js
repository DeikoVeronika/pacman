// Клас для роботи з прямокутниками (позиція та розмір)
function Rect(params) {
  this._x = params.x; // Координата X
  this._y = params.y; // Координата Y
  this._w = params.w; // Ширина
  this._h = params.h; // Висота
}

// Встановлює позицію прямокутника
Rect.prototype.setPosition = function (position) {
  this._x = position.x;
  this._y = position.y;
};

// Повертає позицію прямокутника як об'єкт Position
Rect.prototype.getPosition = function () {
  return new Position(this._x, this._y);
};

// Повертає координату X
Rect.prototype.getX = function () {
  return this._x;
};

// Повертає координату Y
Rect.prototype.getY = function () {
  return this._y;
};

// Повертає ліву межу прямокутника
Rect.prototype.getLeft = function () {
  return this._x;
};

// Повертає праву межу прямокутника
Rect.prototype.getRight = function () {
  return this._x + this._w - 1;
};

// Повертає верхню межу прямокутника
Rect.prototype.getTop = function () {
  return this._y;
};

// Повертає нижню межу прямокутника
Rect.prototype.getBottom = function () {
  return this._y + this._h - 1;
};

// Повертає ширину прямокутника
Rect.prototype.getWidth = function () {
  return this._w;
};

// Повертає висоту прямокутника
Rect.prototype.getHeight = function () {
  return this._h;
};

// Зсуває прямокутник на заданий вектор
Rect.prototype.move = function (vector) {
  this._x += vector.x;
  this._y += vector.y;
};

// Перевіряє, чи перетинається прямокутник з іншим прямокутником
Rect.prototype.intersectsRect = function (other) {
  return !(this.getLeft() > other.getRight() ||
    this.getRight() < other.getLeft() ||
    this.getTop() > other.getBottom() ||
    this.getBottom() < other.getTop());
};
