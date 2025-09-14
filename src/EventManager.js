// Клас EventManager відповідає за підписку та виклик ігрових подій
function EventManager() {
  this._subscribers = {}; // Список підписників для кожної події
}

// Додає підписника на перелік подій
EventManager.prototype.addSubscriber = function (subscriber, events) {
  for (var i in events) {
    if (!this._subscribers[events[i]]) {
      this._subscribers[events[i]] = [];
    }
    this._subscribers[events[i]].push(subscriber);
  }
};

// Викликає подію для всіх підписників
EventManager.prototype.fireEvent = function (event) {
  var subscribers = this._subscribers[event.name];
  for (var i in subscribers) {
    subscribers[i].notify(event);
  }
};
