/**
 * Клас FPSCounter — обгортка над бібліотекою Stats.js для відображення FPS.
 */
function FPSCounter() {
  this._stats = new Stats();
  this._stats.setMode(0); // 0: FPS, 1: ms
  this._stats.domElement.style.position = 'absolute';
  this._stats.domElement.style.right = '0px';
  this._stats.domElement.style.top = '0px';
  document.body.appendChild(this._stats.domElement);
}

// Починає вимірювання кадру
FPSCounter.prototype.begin = function () {
  this._stats.begin();
};

// Завершує вимірювання кадру
FPSCounter.prototype.end = function () {
  this._stats.end();
};
