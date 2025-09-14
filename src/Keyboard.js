// Клас Keyboard відповідає за обробку натискань клавіш користувача
var KEY_ENTER = 13;
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;

// Конструктор. Приймає посилання на гру.
function Keyboard(game) {
  this._game = game; // Посилання на головний об'єкт гри
  this._keysRealTime = {};      // Стан клавіш у реальному часі
  this._keysCurrentFrame = {};  // Стан клавіш у поточному кадрі
  this._listen();               // Запуск прослуховування подій клавіатури
}

// Встановлює обробники подій для натискання та відпускання клавіш
Keyboard.prototype._listen = function () {
  var that = this;
  $(document).keydown(function (event) {
    that._keysRealTime[event.which] = true;
    that._keysCurrentFrame[event.which] = true;
    event.preventDefault();
  });
  $(document).keyup(function (event) {
    that._keysRealTime[event.which] = false;
    event.preventDefault();
  });
};

// Обробляє натискання клавіш у поточному кадрі
Keyboard.prototype.handleKeypresses = function () {
  for (var key in this._keysCurrentFrame) {
    if (this._keysCurrentFrame[key]) {
      this._game.keyPressed(key);
      if (!this._keysRealTime[key]) {
        this._keysCurrentFrame[key] = false;
      }
    }
  }
};
