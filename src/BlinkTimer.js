// Клас BlinkTimer відповідає за таймер блимання (видимість/невидимість елементів)
function BlinkTimer(duration) {
  this._duration = duration; // Тривалість циклу блимання
  this._timer = 0;           // Лічильник часу
  this._visible = true;      // Стан видимості
}

// Оновлює стан таймера, перемикає видимість після закінчення циклу
BlinkTimer.prototype.tick = function () {
  this._timer++;
  if (this._timer == this._duration) {
    this._timer = 0;
    this._visible = !this._visible;
  }
};

// Встановлює нову тривалість циклу блимання
BlinkTimer.prototype.setDuration = function (duration) {
  this._duration = duration;
};

// Повертає поточний стан видимості
BlinkTimer.prototype.isVisible = function () {
  return this._visible;
};
