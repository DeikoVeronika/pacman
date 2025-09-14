// Клас Cherry відповідає за появу, зникнення та поїдання вишні на сцені
var CHERRY_VALUE = 100;

// Конструктор Cherry
function Cherry(scene) {
  this._scene = scene; // Посилання на сцену
  this._appearanceInterval = 400;      // Інтервал появи вишні
  this._visibilityDuration = 200;      // Тривалість видимості
  this._eatenVisibilityDuration = 30;  // Тривалість показу очок після поїдання
  this._timer = 0;                     // Лічильник часу
  this._visible = false;               // Чи видима вишня
  this._eaten = false;                 // Чи з'їдена вишня
  this._rect = new Rect({x: 0, y: 0, w: TILE_SIZE, h: TILE_SIZE}); // Прямокутник для позиції
}

// Встановлює інтервал появи вишні
Cherry.prototype.setAppearanceInterval = function (interval) {
  this._appearanceInterval = interval;
};

// Встановлює тривалість видимості вишні
Cherry.prototype.setVisibilityDuration = function (duration) {
  this._visibilityDuration = duration;
};

// Встановлює тривалість показу очок після поїдання
Cherry.prototype.setEatenVisibilityDuation = function (duration) {
  this._eatenVisibilityDuration = duration;
};

// Змушує вишню з'явитися
Cherry.prototype.appear = function () {
  this._visible = true;
  this._timer = 0;
};

// Ховає вишню
Cherry.prototype.hide = function () {
  this._visible = false;
  this._eaten = false;
  this._timer = 0;
};

// Перевіряє, чи вишня видима
Cherry.prototype.isVisible = function () {
  return this._visible;
};

// Перевіряє, чи вишня з'їдена
Cherry.prototype.isEaten = function () {
  return this._eaten;
};

// Встановлює позицію вишні
Cherry.prototype.setPosition = function (position) {
  this._rect.setPosition(position);
};

// Повертає позицію вишні
Cherry.prototype.getPosition = function () {
  return this._rect.getPosition();
};

// Повертає прямокутник вишні
Cherry.prototype.getRect = function () {
  return this._rect;
};

// Позначає вишню як з'їдену
Cherry.prototype.eat = function () {
  this._eaten = true;
  this._timer = 0;
};

// Оновлює стан вишні (логіка появи, зникнення, поїдання)
Cherry.prototype.tick = function () {
  if (this._scene.isPause()) {
    return;
  }
  
  this._timer++;
  
  if (!this.isVisible() && this._timer >= this._appearanceInterval) {
    this.appear();
  }
  else if (this.isVisible() && !this.isEaten() && this._timer >= this._visibilityDuration) {
    this.hide();
  }
  else if (this.isVisible() && this.isEaten() && this._timer >= this._eatenVisibilityDuration) {
    this.hide();
  }
};

// Малює вишню або очки за неї на сцені
Cherry.prototype.draw = function (ctx) {
  if (!this.isVisible()) {
    return;
  }
  
  var x = this._scene.getX() + this._rect.getX();
  var y = this._scene.getY() + this._rect.getY();
  
  if (this.isEaten()) {
    ctx.fillStyle = "#2abac0";
    ctx.font = "bold 12px 'Lucida Console', Monaco, monospace"
    x -= 4;
    y += 12;
    ctx.fillText(CHERRY_VALUE, x, y);
  }
  else {
    ctx.drawImage(ImageManager.getImage('cherry'), x, y);
  }
};
