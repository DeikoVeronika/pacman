function PacmanPlaySceneStrategy(pacman, scene) {
  this._pacman = pacman; // Посилання на Pacman
  this._scene = scene;   // Посилання на ігрову сцену
}

// Оновлює стан Pacman під час гри
PacmanPlaySceneStrategy.prototype.tick = function () {
  if (this._scene.isPause()) {
    return; // Якщо гра на паузі — нічого не робити
  }
  
  this._pacman.advanceFrame();               // Змінює кадр анімації
  this._pacman.move();                       // Рухається у поточному напрямку
  this._pacman.checkIfOutOfMapBounds();      // Перевіряє вихід за межі карти
  this._pacman.handleCollisionsWithWalls();  // Обробляє зіткнення зі стінами
  this._pacman.handleCollisionsWithPellets();// Обробляє зіткнення з кульками
  this._pacman.handleCollisionsWithGhosts(); // Обробляє зіткнення з привидами
  this._pacman.handleCollisionsWithCherry(); // Обробляє зіткнення з вишнею
};
