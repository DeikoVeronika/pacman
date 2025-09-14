// Клас PointsMessage відповідає за відображення очок за поїдання привида
function PointsMessage(scene) {
  this._scene = scene; // Посилання на сцену
  this._visibilityDuration = 15; // Тривалість показу повідомлення
}

// Оновлює таймер видимості повідомлення
PointsMessage.prototype.tick = function () {
  if (this._timeToHide == 0) {
    return;
  }
  this._timeToHide--;
  if (this._timeToHide == 0) {
    this._ghost.setVisible(true);
    this._scene.getPacman().setVisible(true);
  }
};

// Встановлює тривалість видимості повідомлення
PointsMessage.prototype.setVisibilityDuration = function (duration) {
  this._visibilityDuration = duration;
};

// Перевіряє, чи повідомлення ще видиме
PointsMessage.prototype.isVisible = function () {
  return this._timeToHide > 0;
};

// Встановлює значення очок для повідомлення
PointsMessage.prototype.setValue = function (value) {
  this._value = value;
};

// Повертає значення очок
PointsMessage.prototype.getValue = function () {
  return this._value;
};

// Встановлює позицію повідомлення
PointsMessage.prototype.setPosition = function (position) {
  this._position = position;
};

// Повертає позицію повідомлення
PointsMessage.prototype.getPosition = function () {
  return this._position;
};

// Встановлює привида, якого було з'їдено
PointsMessage.prototype.setEatenGhost = function (ghost) {
  this._ghost = ghost;
};

// Показує повідомлення та ховає Pacman і привида
PointsMessage.prototype.show = function () {
  this._timeToHide = this._visibilityDuration;
  this._ghost.setVisible(false);
  this._scene.getPacman().setVisible(false);
};

// Малює повідомлення з очками на екрані, якщо воно видиме
PointsMessage.prototype.draw = function (ctx) {
  if (!this.isVisible()) {
    return;
  }

  ctx.fillStyle = "#2abac0";
  ctx.font = "bold 12px 'Lucida Console', Monaco, monospace"
  var x = this._scene.getX() + this._position.x - 4;
  var y = this._scene.getY() + this._position.y + 12;
  ctx.fillText(this._value, x, y);
};
