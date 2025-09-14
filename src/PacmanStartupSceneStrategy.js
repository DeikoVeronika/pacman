// Стратегія руху Pacman на стартовій сцені (анімований рух туди-назад)
function PacmanStartupSceneStrategy(pacman, scene) {
  this._pacman = pacman; // Посилання на Pacman
  this._scene = scene;   // Посилання на сцену
}

// Оновлює стан Pacman на стартовій сцені
PacmanStartupSceneStrategy.prototype.tick = function () {
  this._pacman.advanceFrame(); // Змінює кадр анімації
  this._pacman.move();         // Рухається у поточному напрямку
  
  // Зміна напрямку руху при досягненні меж
  if (this._pacman.getX() >= 440) {
    this._pacman.setDirection(DIRECTION_LEFT);
  }
  else if (this._pacman.getX() < 90) {
    this._pacman.setDirection(DIRECTION_RIGHT);
  }
};
