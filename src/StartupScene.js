// Клас сцени стартового екрану гри
function StartupScene(game) {
  this._game = game; // Посилання на головний об'єкт гри
  this._pressEnterText = new PressEnterText(); // Текст "PRESS ENTER"
  
  // Ініціалізація Pacman для стартової сцени
  this._pacman = new Pacman(this, game);
  this._pacman.setStrategy(new PacmanStartupSceneStrategy(this._pacman, this));
  this._pacman.setCurrentSpeed(4);
  this._pacman.setSpeed(4);
  this._pacman.setPosition(new Position(90, 160));
  this._pacman.setDirection(DIRECTION_RIGHT);
}

// Обробка натискання клавіш на стартовій сцені
StartupScene.prototype.keyPressed = function (key) {
  if (key == KEY_ENTER) {
    this._game.setScene(new PlayScene(this._game)); // Перехід до ігрової сцени
  }
};

// Оновлення стану сцени (анімування Pacman та тексту)
StartupScene.prototype.tick = function () {
  this._pressEnterText.tick();
  this._pacman.tick();
};

// Малювання всіх елементів стартової сцени
StartupScene.prototype.draw = function (ctx) {
  this._drawTitle(ctx);
  this._drawControlsHelp(ctx);
  this._pressEnterText.draw(ctx);
  this._pacman.draw(ctx);
};

// Повертає координату X сцени (завжди 0)
StartupScene.prototype.getX = function () {
  return 0;
};

// Повертає координату Y сцени (завжди 0)
StartupScene.prototype.getY = function () {
  return 0;
};

// Малює заголовок гри
StartupScene.prototype._drawTitle = function (ctx) {
  ctx.fillStyle = "#ffff00";
  ctx.font = "bold 90px 'Lucida Console', Monaco, monospace"
  ctx.fillText("PAC-MAN", 76, 150);
};

// Малює підказку з керуванням
StartupScene.prototype._drawControlsHelp = function (ctx) {
  ctx.fillStyle = "#dedede";
  ctx.font = "bold 14px 'Lucida Console', Monaco, monospace"
  ctx.fillText("CONTROL: ARROW KEYS", 187, 300);
};
