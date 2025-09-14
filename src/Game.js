// Клас Game відповідає за поточну сцену гри та менеджер подій
function Game() {
  this._scene = new StartupScene(this); // Поточна сцена (стартова)
  this._eventManager = new EventManager(); // Менеджер подій
}

// Повертає менеджер подій
Game.prototype.getEventManager = function () {
  return this._eventManager;
};

// Встановлює поточну сцену гри
Game.prototype.setScene = function (scene) {
  this._scene = scene;
};

// Повертає поточну сцену гри
Game.prototype.getScene = function () {
  return this._scene;
};

// Передає натискання клавіші поточній сцені
Game.prototype.keyPressed = function (key) {
  this._scene.keyPressed(key);
};

// Оновлює стан поточної сцени
Game.prototype.tick = function () {
  this._scene.tick();
};

// Малює поточну сцену на поверхні
Game.prototype.draw = function (surface) {
  this._scene.draw(surface);
};
