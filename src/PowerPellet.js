// Клас PowerPellet відповідає за велику кульку, яка дає Pacman можливість їсти привидів
function PowerPellet(scene) {
  this._scene = scene; // Посилання на сцену
  this._rect = new Rect({x: 0, y: 0, w: TILE_SIZE, h: TILE_SIZE}); // Прямокутник для позиції та розміру
  this._blinkTimer = new BlinkTimer(13); // Таймер для блимання кульки
}

// Повертає прямокутник PowerPellet
PowerPellet.prototype.getRect = function () {
  return this._rect;
};

// Повертає кількість очок за цю кульку
PowerPellet.prototype.getValue = function () {
  return 50;
};

// Встановлює тривалість блимання
PowerPellet.prototype.setBlinkDuration = function (duration) {
  this._blinkTimer.setDuration(duration);
};

// Перевіряє, чи кулька видима (блимає)
PowerPellet.prototype.isVisible = function () {
  return this._blinkTimer.isVisible();
};

// Оновлює стан блимання
PowerPellet.prototype.tick = function () {
  this._blinkTimer.tick();
};

// Малює PowerPellet на canvas, якщо вона видима
PowerPellet.prototype.draw = function (ctx) {
  if (!this._blinkTimer.isVisible()) {
    return;
  }

  var x = this._scene.getX() + this.getX();
  var y = this._scene.getY() + this.getY();

  ctx.drawImage(ImageManager.getImage('power_pellet'), x, y);
};


/*--------------------------- Делегування методів Rect --------------------------------*/

// Встановлює позицію PowerPellet
PowerPellet.prototype.setPosition = function (position) {
  this._rect.setPosition(position);
};

// Повертає позицію PowerPellet
PowerPellet.prototype.getPosition = function () {
  return this._rect.getPosition();
};

// Повертає координату X PowerPellet
PowerPellet.prototype.getX = function () {
  return this._rect.getX();
};

// Повертає координату Y PowerPellet
PowerPellet.prototype.getY = function () {
  return this._rect.getY();
};

// Повертає ліву межу PowerPellet
PowerPellet.prototype.getLeft = function () {
  return this._rect.getLeft();
};

// Повертає праву межу PowerPellet
PowerPellet.prototype.getRight = function () {
  return this._rect.getRight();
};

// Повертає верхню межу PowerPellet
PowerPellet.prototype.getTop = function () {
  return this._rect.getTop();
};

// Повертає нижню межу PowerPellet
PowerPellet.prototype.getBottom = function () {
  return this._rect.getBottom();
};

// Повертає ширину PowerPellet
PowerPellet.prototype.getWidth = function () {
  return this._rect.getWidth();
};

// Повертає висоту PowerPellet
PowerPellet.prototype.getHeight = function () {
  return this._rect.getHeight();
};
