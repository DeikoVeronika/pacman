// Стратегія анімації смерті Pacman
function PacmanDiesStrategy(pacman) {
  this._pacman = pacman; // Посилання на Pacman
}

// Оновлює стан анімації смерті Pacman
PacmanDiesStrategy.prototype.tick = function () {
  this._pacman.advanceDeathFrame(); // Змінює кадр анімації смерті
  
  // Якщо анімація завершена або її потрібно пропустити — викликає завершення
  if (this._pacman.isDiesAnimationCompleted() || this._pacman.shouldSkipDiesAnimation()) {
    this._pacman.diesAnimationCompleted();
  }
};
