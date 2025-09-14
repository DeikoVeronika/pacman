// Клас для відображення та анімації тексту "PRESS ENTER" на стартовому екрані
function PressEnterText() {
  this._blinkTimer = new BlinkTimer(15); // Таймер для блимання тексту
}

// Оновлює стан блимання тексту
PressEnterText.prototype.tick = function () {
  this._blinkTimer.tick();
};

// Малює текст "PRESS ENTER" на екрані, якщо він видимий
PressEnterText.prototype.draw = function (ctx) {
  if (!this._blinkTimer.isVisible()) {
    return;
  }
  
  ctx.fillStyle = "red";
  ctx.font = "bold 18px 'Lucida Console', Monaco, monospace"
  var text = "PRESS ENTER";
  var textWidth = ctx.measureText(text).width;
  // Малює текст по центру canvas
  var x = ctx.canvas.width / 2 - textWidth / 2;
  var y = ctx.canvas.height / 2;
  ctx.fillText(text, x, y);
};
