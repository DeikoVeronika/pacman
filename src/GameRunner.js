// Клас GameRunner відповідає за запуск ігрового циклу, створення canvas та ініціалізацію гри
var FPS = 24;
var CANVAS_WIDTH = 540;
var CANVAS_HEIGHT = 484;

// Конструктор GameRunner
function GameRunner() {
  this._ctx = this._createCanvasContext(); // Контекст canvas
  this._game = new Game();                 // Головний об'єкт гри
  this._keyboard = new Keyboard(this._game); // Клавіатурний контролер
  
  // Додає SoundManager як підписника на ігрові події
  this._game.getEventManager().addSubscriber(SoundManager,
    [EVENT_PELLET_EATEN,
     EVENT_POWER_PELLET_EATEN,
     EVENT_GHOST_EATEN,
     EVENT_PACMAN_DIES_ANIMATION_STARTED,
     EVENT_PLAYSCENE_READY,
     EVENT_CHERRY_EATEN]);
}

// Запускає ігровий цикл
GameRunner.prototype.run = function () {
  var that = this;
  setInterval(function () { that._gameLoop(); }, 1000 / FPS);
};

// Створює та повертає контекст canvas
GameRunner.prototype._createCanvasContext = function () {
  var CANVAS_ID = 'canvas';
  $('<canvas id="' + CANVAS_ID + '" width="' + CANVAS_WIDTH + '" height="' + CANVAS_HEIGHT + '"></canvas>').appendTo('#main');
  var canvas = document.getElementById(CANVAS_ID);
  return canvas.getContext('2d');
};

// Основний ігровий цикл: обробка клавіш, оновлення стану гри, малювання
GameRunner.prototype._gameLoop = function () {
  this._keyboard.handleKeypresses();
  this._game.tick();
  
  this._clearCanvas();
  this._game.draw(this._ctx);
};

// Очищає canvas перед малюванням нового кадру
GameRunner.prototype._clearCanvas = function () {
  this._ctx.fillStyle = "black";
  this._ctx.fillRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
};
