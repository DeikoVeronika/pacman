// Клас для відображення повідомлення "READY!" перед початком гри
var READY_MESSAGE_DURATION_SHORT = 50; // Коротка тривалість показу
var READY_MESSAGE_DURATION_LONG = 100; // Довга тривалість показу

function ReadyMessage() {}

// Встановлює тривалість видимості повідомлення
ReadyMessage.prototype.setVisibilityDuration = function (duration) {
  this._visibilityDuration = duration;
};

// Встановлює час до приховування повідомлення
ReadyMessage.prototype.setTimeToHide = function (duration) {
  this._timeToHide = duration;
};

// Повертає залишок часу до приховування
ReadyMessage.prototype.getTimeToHide = function () {
  return this._timeToHide;
};

// Перевіряє, чи повідомлення ще видиме
ReadyMessage.prototype.isVisible = function () {
  return this._timeToHide > 0;
};

// Показує повідомлення на заданий час
ReadyMessage.prototype.show = function () {
  this._timeToHide = this._visibilityDuration;
};

// Приховує повідомлення
ReadyMessage.prototype.hide = function () {
  this._timeToHide = 0;
};

// Оновлює таймер видимості повідомлення
ReadyMessage.prototype.tick = function () {
  if (this.isVisible()) {
    this._timeToHide--;
  }
};

// Малює повідомлення "READY!" на екрані, якщо воно видиме
ReadyMessage.prototype.draw = function (ctx) {
  if (!this.isVisible()) {
    return;
  }
  
  ctx.fillStyle = "#ffff00";
  ctx.font = "bold 18px 'Lucida Console', Monaco, monospace"
  ctx.fillText("READY!", 234, 273);
};
