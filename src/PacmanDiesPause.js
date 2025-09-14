// Клас для паузи після смерті Pacman перед запуском анімації смерті
function PacmanDiesPause(scene, game) {
  this._scene = scene;   // Посилання на сцену
  this._game = game;     // Посилання на гру
  this._duration = 15;   // Тривалість паузи (в кадрах)
  this._timer = 0;       // Лічильник часу
  this._active = false;  // Чи активна пауза
  this._pacman = scene.getPacman(); // Посилання на Pacman
}

// Встановлює тривалість паузи
PacmanDiesPause.prototype.setDuration = function (duration) {
  this._duration = duration;
};

// Оновлює стан паузи (збільшує таймер, запускає анімацію смерті)
PacmanDiesPause.prototype.tick = function () {
  if (!this._active) {
    return;
  }
  this._timer++;
  if (this._timer > this._duration) {
    this._active = false;
    this._scene.hideGhosts(); // Ховає привидів
    this._game.getEventManager().fireEvent({'name': EVENT_PACMAN_DIES_ANIMATION_STARTED});
    this._pacman.setStrategy(new PacmanDiesStrategy(this._pacman)); // Запускає анімацію смерті
  }
};

// Активує паузу (обнуляє таймер і вмикає стан паузи)
PacmanDiesPause.prototype.activate = function () {
  this._timer = 0;
  this._active = true;
};

// Перевіряє, чи пауза активна
PacmanDiesPause.prototype.isActive = function () {
  return this._active;
};
