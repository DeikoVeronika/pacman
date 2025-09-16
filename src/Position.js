function Position(x, y) {
  this.x = x;
  this.y = y;
}

Position.prototype.clone = function () {
  return new Position(this.x, this.y);
};

Position.prototype.getDistance = function (position) {
  var dx = this.x - position.x;
  var dy = this.y - position.y;
  return Math.sqrt(dx * dx + dy * dy);
};

Position.prototype.equals = function (position) {
  return this.x == position.x && this.y == position.y;
};