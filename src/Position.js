// Клас для зберігання координат X та Y
function Position(x, y) {
  this.x = x;
  this.y = y;
}

// Перевіряє, чи співпадають координати з іншою позицією
Position.prototype.equals = function (other) {
  return this.x == other.x && this.y == other.y;
};
