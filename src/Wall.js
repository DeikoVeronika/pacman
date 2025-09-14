// Клас Wall відповідає за відображення та позицію стіни на сцені
function Wall(image, scene) {
  this._image = image; // Зображення стіни
  this._scene = scene; // Посилання на сцену
  this._rect = new Rect({x: 0, y: 0, w: TILE_SIZE, h: TILE_SIZE}); // Прямокутник для позиції та розміру
}

// Повертає прямокутник стіни
Wall.prototype.getRect = function () {
  return this._rect;
};

// Повертає ім'я зображення стіни
Wall.prototype.getImage = function () {
  return this._image;
};

// Малює стіну на canvas
Wall.prototype.draw = function (ctx) {
  var x = this._scene.getX() + this.getX();
  var y = this._scene.getY() + this.getY();
  ctx.drawImage(ImageManager.getImage(this._image), x, y);
};


/*--------------------------- Делегування методів Rect --------------------------------*/

// Встановлює позицію стіни
Wall.prototype.setPosition = function (position) {
  this._rect.setPosition(position);
};

// Повертає позицію стіни
Wall.prototype.getPosition = function () {
  return this._rect.getPosition();
};

// Повертає координату X
Wall.prototype.getX = function () {
  return this._rect.getX();
};

// Повертає координату Y
Wall.prototype.getY = function () {
  return this._rect.getY();
};

// Повертає ліву межу
Wall.prototype.getLeft = function () {
  return this._rect.getLeft();
};

// Повертає праву межу
Wall.prototype.getRight = function () {
  return this._rect.getRight();
};

// Повертає верхню межу
Wall.prototype.getTop = function () {
  return this._rect.getTop();
};

// Повертає нижню межу
Wall.prototype.getBottom = function () {
  return this._rect.getBottom();
};

// Повертає ширину стіни
Wall.prototype.getWidth = function () {
  return this._rect.getWidth();
};

// Повертає висоту стіни
Wall.prototype.getHeight = function () {
  return this._rect.getHeight();
};
