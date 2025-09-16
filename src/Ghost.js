// Визначає поведінку та логіку об'єктів-привидів у грі

// Ідентифікатори для кожного привида
var GHOST_BLINKY = 'blinky';
var GHOST_PINKY = 'pinky';
var GHOST_INKY = 'inky';
var GHOST_CLYDE = 'clyde';

// Можливі стани, в яких може перебувати привид
var GHOST_STATE_NORMAL = 'normal';       // Звичайний режим полювання
var GHOST_STATE_VULNERABLE = 'vulnerable'; // Режим вразливості (після з'їдання енерджайзера)
var GHOST_STATE_RUN_HOME = 'run_home';     // Режим повернення на базу (після того, як його з'їли)

// Константи швидкостей привидів
var GHOST_SPEED_FAST = 8;
var GHOST_SPEED_NORMAL = 4;
var GHOST_SPEED_SLOW = 2;

// Конструктор
function Ghost(name, scene) {
  this._name = name; // Зберігає ім'я привида
  this._scene = scene; // Зберігає посилання на ігрову сцену, щоб привид міг взаємодіяти з картою та Пакменом.
  
  // --- Фізика та відображення ---
  this._sprite = new Sprite(scene); // Створює об'єкт Sprite, який керує позицією, рухом та зіткненнями.
  this._sprite.setRect(new Rect({x: 0, y: 0, w: TILE_SIZE, h: TILE_SIZE})); // Встановлює розмір привида (хітбокс) рівним одній клітинці.
  this._state = GHOST_STATE_NORMAL; // Початковий стан привида - звичайне переслідування.
  this._visible = true; // Визначає, чи є привид видимим на екрані.
  this.setDirection(DIRECTION_UP); // Початковий напрямок руху (зазвичай вгору, щоб вийти з лігва).

  // --- Налаштування анімації --- 
  this._bodyFrames = [1,2]; // Масив з номерами кадрів для анімації руху ( "плавання" привида).
  this._bodyFrame = 0; // Індекс поточного кадру анімації з масиву _bodyFrames.

  // --- Налаштування таймерів для режиму вразливості (коли Пакмен з'їв енерджайзер) ---
  this._vulnerabilityDuration = 150; // Загальна тривалість стану вразливості в ігрових тіках (кадрах).
  this._flashingDuration = 50;    // Кількість тіків до кінця вразливості, коли привид починає блимати.
  this._blinkDuration = 7;        // Тривалість кожного блимання (увімк/вимк).
  this._blinkTimer = 0; // Внутрішній лічильник для керування блиманням.
  this._vulnerableTimeLeft = 0; // Лічильник, що показує, скільки часу залишилось бути вразливим.
  this._blink = false; // Прапорець, що вказує, чи блимає привид зараз.

  this.setCurrentSpeed(GHOST_SPEED_NORMAL); // Встановлює початкову швидкість привида.
}

 // Повертає ім'я привида.
Ghost.prototype.getName = function () { return this._name; };

// Встановлює, чи є привид видимим.
Ghost.prototype.setVisible = function (value) { this._visible = value; }; 

// Перевіряє, чи є привид видимим.
Ghost.prototype.isVisible = function () { return this._visible; }; 


// Оновлення стану привида, викликається кожного кадру
Ghost.prototype.tick = function () {
  if (this._scene.isPause()) { return; } // Не оновлювати, якщо гра на паузі

  this._advanceBodyFrame(); // анімація руху привида

  // --- визначення поведінки ---
  if (this._state == GHOST_STATE_VULNERABLE) {  // Якщо привид вразливий
    this._advanceVulnerableStateTimers();
    
    if (this._vulnerableTimeLeft == 0) {  // Якщо час вразливості вийшов, повертаємо привида у звичайний стан.
      this.makeNormal(); 
    }
  }

  // --- логіка вибору напрямку руху ---
  if (this._state == GHOST_STATE_RUN_HOME) {
    this._runHomeLogic(); // Якщо привида з'їли, він просто біжить додому по прорахованому шляху.
  } else {
    this._makeDecision(); // Якщо привид полює або вразливий, він приймає рішення, куди повернути.
  }

  // --- фізичний рух та зіткнення
  this._sprite.move(this.getDirection()); // Переміщення тіла привида
  this._sprite.checkIfOutOfMapBounds(); // Перевіряємо, чи не вийшов привид за межі карти (для телепортації через тунелі)
  this._handleCollisionsWithWalls(); // Обробляємо зіткнення зі стінами, щоб привид не проходив крізь них
};


// Обробляє логіку повернення привида на базу.
Ghost.prototype._runHomeLogic = function () { 
  // якщо привид досягнув лігва
  if (this.getPosition().equals(this._scene.getLairPosition())) { 
    this.makeNormal();
    this._sprite.setDirection(DIRECTION_UP);
    return;
  }

  // якщо досягли точку маршруту
  if (this.getPosition().equals(this._currentWaypoint)) {
    this._currentWaypoint = this._wayPoints.shift(); // Беремо наступну точку з  списку `_wayPoints`
    this._setDirectionToCurrentWaypoint(); // Визначаємо новий напрямок руху до цієї нової точки
  }
};

// Змінює кадр анімації тіла привида.
Ghost.prototype._advanceBodyFrame = function () {
  this._bodyFrame++;
  if (this._bodyFrame >= this._bodyFrames.length) { this._bodyFrame = 0; }
};

// Встановлює напрямок руху до наступної точки маршруту (при поверненні додому).
Ghost.prototype._setDirectionToCurrentWaypoint = function () {
  if (this._currentWaypoint.x == this.getX()) { // якщо на вертикальній лінії з наступною точкою => рухаємо вгору/вниз
    this._sprite.setDirection(this._currentWaypoint.y > this.getY() ? DIRECTION_DOWN : DIRECTION_UP); 
  } else { // якщо на горизонтальній
    this._sprite.setDirection(this._currentWaypoint.x > this.getX() ? DIRECTION_RIGHT : DIRECTION_LEFT);
  }
};


// ===================================================================
// РЕАЛІЗАЦІЯ ПОВЕДІНКИ ПРИВИДІВ
// ===================================================================

// Обробляє логіку виходу привида з лігва
Ghost.prototype._handleLairExit = function () {
  // Якщо привид уже вийшов, одразу повертаємо false, щоб передати керування _makeDecision
  if (this._exitedLair) {
    return false;
  }

  const lairPos = this._scene.getLairPosition(); // Отримуємо координати центральної точки виходу з лігва

  // Якщо привид ще всередині "будиночка"
  if (this.getY() >= lairPos.y) {

    // Рухаємось по горизонталі до центру
    if (this.getX() < lairPos.x) { // Якщо зліва від центру - йдемо праворуч.
      this.setDirection(DIRECTION_RIGHT); 
    } else if (this.getX() > lairPos.x) { // Якщо справа від центру - йдемо ліворуч
      this.setDirection(DIRECTION_LEFT);  
    } else { // Коли вирівнялись по горизонталі - рухаємось вгору до воріт
      this.setDirection(DIRECTION_UP);    
    }

    // Повертаємо `true`, щоб повідомити `tick()`, що ми зараз керуємо рухом.
    // Це тимчасово блокує роботу звичайного AI.
    return true; 
  } 
  
  else { // привид щойно перетнув лінію воріт
    this._exitedLair = true; // Встановлюємо прапорець, що привид вийшов
    return false;     // Повертаємо `false`, щоб з наступного кадру керування перейшло до звичайного AI.
  }
};


// Основний метод прийняття рішень про напрямок руху привида.
Ghost.prototype._makeDecision = function () {
  // якщо привид випадково повернувся додому - скидаємо прапорець, щоб він міг вийти знову
  if (this.getState() === GHOST_STATE_NORMAL && this._scene.isPositionInLair(this.getPosition())) {
      this._exitedLair = false;
  }

  // Якщо привид не на перехресті , нічого не вирішуємо і виходимо
  if (!this._canTurn()) {
    return;
  }

  // Спробувати виконати логіку виходу з лігва
  if (this._handleLairExit()) {
    return;
  }

  // Стандартний режим полювання (виконується, тільки якщо попередні кроки не спрацювали)
  const targetTile = this._getTargetTile(); // Визначаємо ціль - пошук пакмена
  const possibleTurns = this._getPossibleTurns(); // Пошук доступних шляхів

  if (possibleTurns.length === 0) {
    return;
  }

  const bestTurn = this._getBestTurn(possibleTurns, targetTile); // обираємо найкращий поворот
  this.setDirection(bestTurn);
};


// Перевіряє, чи знаходиться привид на перехресті
Ghost.prototype._canTurn = function() {
  // Повертає true, тільки якщо X та Y координати привида діляться на розмір клітинки (`TILE_SIZE`)
  // без залишку (%). Це означає, що привид ідеально вирівняний по сітці 
  // і знаходиться у точці, де можна змінити напрямок.
  return this.getX() % TILE_SIZE === 0 && this.getY() % TILE_SIZE === 0;
};

// Визначає цільову клітинку для привида згідно з рівнем складності.
Ghost.prototype._getTargetTile = function () {
  switch (gameDifficulty) {
    case 'easy':
      return this._getTargetTileEasy();
    case 'normal':
      return this._getTargetTileNormal();
    case 'hard':
      return this._getTargetTileHard();
    default:
      return this._getTargetTileEasy();
  }
};

// Поведінка привидів на легкому рівні складності.
Ghost.prototype._getTargetTileEasy = function () {
  // Всі привиди рухаються до випадкової точки на карті.
  return new Position(getRandomInt(0, this._scene.getWidth()), getRandomInt(0, this._scene.getHeight()));
};

// Поведінка привидів на середньому рівні складності.
Ghost.prototype._getTargetTileNormal = function () {
  const pacman = this._scene.getPacman();
  const pacmanPos = pacman.getPosition(); // Позиція Пакмена
  const pacmanDir = pacman.getDirection(); // Напрямок руху Пакмена

  switch (this.getName()) {
    //Червоний
    case GHOST_BLINKY: 
      return pacmanPos; // Ціль Blinky — це завжди точна поточна позиція Пакмена.

    // Рожевий
    case GHOST_PINKY:
      // Pinky намагається передбачити рух Пакмена і зайти наперед.
      // Створюємо ціль на 4 клітинки попереду напрямку руху Пакмена.
      const pinkyTarget = new Position(pacmanPos.x, pacmanPos.y);
      switch (pacmanDir) {
        case DIRECTION_UP:    pinkyTarget.y -= 4 * TILE_SIZE; break;
        case DIRECTION_DOWN:  pinkyTarget.y += 4 * TILE_SIZE; break;
        case DIRECTION_LEFT:  pinkyTarget.x -= 4 * TILE_SIZE; break;
        case DIRECTION_RIGHT: pinkyTarget.x += 4 * TILE_SIZE; break;
      }
      return pinkyTarget;

    // Блакитний та Помаранчевий
    case GHOST_INKY:
    case GHOST_CLYDE:
      // Їхня поведінка залежить від відстані до Пакмена.
      const distance = this.getPosition().getDistance(pacmanPos);

      // Якщо Пакмен близько менше 5 клітинок
      if (distance < 5 * TILE_SIZE) {
        return pacmanPos; // ...вони переслідують його напряму, як Blinky.
      } else {
        // Інакше рухаються випадково.
        return new Position(getRandomInt(0, this._scene.getWidth()), getRandomInt(0, this._scene.getHeight()));
      }
  }
  return pacmanPos; // Запасний варіант
};

// Поведінка привидів на важкому рівні складності.
Ghost.prototype._getTargetTileHard = function () {
  const pacman = this._scene.getPacman();
  const pacmanPos = pacman.getPosition(); // Позиція
  const pacmanDir = pacman.getDirection(); // Напрямок руху

  switch (this.getName()) {
    case GHOST_BLINKY:
      // Blinky: агресивне переслідування
      return pacmanPos;

    case GHOST_PINKY:
      // Pinky намагається відрізати шлях Пакмену, цілячись на 4 клітинки попереду нього
      const pinkyTarget = new Position(pacmanPos.x, pacmanPos.y);
      switch (pacmanDir) {
        case DIRECTION_UP:    pinkyTarget.y -= 4 * TILE_SIZE; break;
        case DIRECTION_DOWN:  pinkyTarget.y += 4 * TILE_SIZE; break;
        case DIRECTION_LEFT:  pinkyTarget.x -= 4 * TILE_SIZE; break;
        case DIRECTION_RIGHT: pinkyTarget.x += 4 * TILE_SIZE; break;
      }
      return pinkyTarget;

    case GHOST_INKY:
      // Inky використовує позиції і Пакмена, і Blinky для побудови пастки
      const blinky = this._scene.getGhost(GHOST_BLINKY);
      if (!blinky) return pacmanPos; // Якщо Blinky з'їли, Inky переходить до простого переслідування.

      // Визначаємо точку на 2 клітинки попереду Пакмена
      const pacmanAhead = new Position(pacmanPos.x, pacmanPos.y);
      switch (pacmanDir) {
        case DIRECTION_UP:    pacmanAhead.y -= 2 * TILE_SIZE; break;
        case DIRECTION_DOWN:  pacmanAhead.y += 2 * TILE_SIZE; break;
        case DIRECTION_LEFT:  pacmanAhead.x -= 2 * TILE_SIZE; break;
        case DIRECTION_RIGHT: pacmanAhead.x += 2 * TILE_SIZE; break;
      }

      // Ціль Inky — це точка, симетрична позиції Blinky відносно точки попереду Пакмена
      // Це створює ефект взяття Пакмена в "кліщі" між Blinky та Inky.
      return new Position(
        pacmanAhead.x + (pacmanAhead.x - blinky.getX()),
        pacmanAhead.y + (pacmanAhead.y - blinky.getY())
      );

    case GHOST_CLYDE:
      // Поведінка Clyde залежить від його близькості до Пакмена.
      const distance = this.getPosition().getDistance(pacmanPos);

      // Якщо він далеко (більше 8 клітинок)
      if (distance > 8 * TILE_SIZE) {
        return pacmanPos; // ...він сміливо переслідує Пакмена, як Blinky
      } else {
        return new Position(0, this._scene.getHeight()); // тікає у  лівий нижній кут
      }
  }
  return pacmanPos; 
};


// Обирає найкращий поворот, щоб наблизитись до цілі.
Ghost.prototype._getBestTurn = function (possibleTurns, targetTile) {
  var bestTurn = -1; // Тут буде зберігатися найкращий знайдений напрямок
  var minDistance = Infinity; // Найкоротша відстань до цілі

  // Перебираємо в циклі  всі доступні  повороти
  for (var i = 0; i < possibleTurns.length; i++) {
    var turn = possibleTurns[i];

    // Створюємо "уявну" позицію, щоб перевірити, де ми опинимося, ЯКЩО зробимо цей поворот.
    var nextPos = new Position(this.getX(), this.getY()); 

    // Симулюємо один крок в обраному напрямку, змінюючи "уявну" позицію.
    if (turn === DIRECTION_UP) nextPos.y -= TILE_SIZE;
    if (turn === DIRECTION_DOWN) nextPos.y += TILE_SIZE;
    if (turn === DIRECTION_LEFT) nextPos.x -= TILE_SIZE;
    if (turn === DIRECTION_RIGHT) nextPos.x += TILE_SIZE;
    
    // Розрахунок відстані до цілі за теоремою Піфагора
    var dx = nextPos.x - targetTile.x;
    var dy = nextPos.y - targetTile.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    // чи є цей шлях коротшим за найкращий, знайдений досі?
    if (distance < minDistance) {
      minDistance = distance; // Якщо так, оновлюємо найкоротшу відстань
      bestTurn = turn; // І запам'ятовуємо цей поворот як найкращий на даний момент
    }
  }
  return bestTurn; // повертаємо найкращий знайдений поворот
};


// Повертає список можливих напрямків (крім стін та розвороту).
Ghost.prototype._getPossibleTurns = function () {
  const directions = [DIRECTION_UP, DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT];
  const oppositeDirection = this._getOppositeDirection(this.getDirection());
  let possibleTurns = [];

  // Шукаємо всі можливі ходи ігноруючи розворот.
  for (let i = 0; i < directions.length; i++) {
    const direction = directions[i];

    if (direction === oppositeDirection) { // Пропускаємо протилежний напрямок
      continue;
    }

    if (!this._sprite.willCollideWithWallIfMovedInDirection(direction)) { // Додаємо напрямок до списку, якщо там немає стіни
      possibleTurns.push(direction);
    }
  }

  // Якщо є хоча б один хід (прямо, вліво, вправо), то повертаємо цей список (розворот навіть не розглядається)
  if (possibleTurns.length > 0) {
    return possibleTurns; 
  }

  // Якщо глухий кут, то єдиний вихід — розвернутися
  if (!this._sprite.willCollideWithWallIfMovedInDirection(oppositeDirection)) {
    return [oppositeDirection]; // Повертаємо масив з одного елемента — протилежного напрямку
  }

  return []; // Якщо привид повністю заблокований
};

// Повертає протилежний напрямок до заданого.
Ghost.prototype._getOppositeDirection = function (direction) {
  if (direction === DIRECTION_UP) return DIRECTION_DOWN;
  if (direction === DIRECTION_DOWN) return DIRECTION_UP;
  if (direction === DIRECTION_LEFT) return DIRECTION_RIGHT;
  if (direction === DIRECTION_RIGHT) return DIRECTION_LEFT;
  return -1;
};

// Обробляє зіткнення зі стінами.
Ghost.prototype._handleCollisionsWithWalls = function () {
  var touchedWall = this._sprite.getTouchedWall();
  if (touchedWall != null) { this._sprite.resolveCollisionWithWall(touchedWall); }
};

// Повертає поточний стан привида.
Ghost.prototype.getState = function () { return this._state; };

// Переводить привида у звичайний стан полювання.
Ghost.prototype.makeNormal = function () {
  this._state = GHOST_STATE_NORMAL;
  this.setCurrentSpeed(GHOST_SPEED_NORMAL);
  this._blink = false;
};

// Встановлює тривалість режиму вразливості.
Ghost.prototype.setVulnerabilityDuration = function (duration) { this._vulnerabilityDuration = duration; };

// Встановлює, за скільки до кінця вразливості починати блимати.
Ghost.prototype.setFlashingDuration = function (duration) { this._flashingDuration = duration; };

// Встановлює швидкість блимання.
Ghost.prototype.setBlinkDuration = function (duration) { this._blinkDuration = duration; };

// Повертає час, що залишився у режимі вразливості.
Ghost.prototype.getVulnerableTimeLeft = function () { return this._vulnerableTimeLeft; };

// Перевіряє, чи блимає привид.
Ghost.prototype.isBlink = function () { return this._blink; };


// Оновлює таймери та стан блимання в режимі вразливості.
Ghost.prototype._advanceVulnerableStateTimers = function () {
  this._vulnerableTimeLeft--; // Зменшуємо загальний час, що залишився у стані вразливості

  // Перевірка початку блимання. Спрацьовує, коли часу залишиться рівно стільки, скільки відведено на блимання
  if (this._flashingDuration == this._vulnerableTimeLeft) {
    this._blink = true; // Вмикаємо стан блимання.
    this._blinkTimer = 0; // Скидаємо лічильник блимання
  }

  // Процес блимання. Працює безперервно, поки триває період блимання
  if (this._vulnerableTimeLeft < this._flashingDuration) {
    this._blinkTimer++; // Збільшуємо лічильник, який відповідає за швидкість блимання.

    // Коли лічильник досягає заданої тривалості одного блимання
    if (this._blinkTimer == this._blinkDuration) {
      this._blinkTimer = 0; // ...скидаємо його, щоб почати відлік для наступного блимання.
      this._blink = !this._blink; // ...і змінюємо значення стану на протилежне (true -> false -> true ...), що і створює ефект.
    }
  }
};


// Переводить привида у режим вразливості.
Ghost.prototype.makeVulnerable = function () {
  // Перевіряємо, чи може цей привид стати вразливим.
  // Він не може, якщо його вже з'їли і він біжить додому (очима).
  // Якщо з'їсти новий енерджайзер, поки діє старий, таймер просто оновиться.
  if (this._state == GHOST_STATE_NORMAL || this._state == GHOST_STATE_VULNERABLE) {
    this._state = GHOST_STATE_VULNERABLE; // Змінюємо стан на "вразливий". Привид тепер синій
    this.setCurrentSpeed(GHOST_SPEED_SLOW); // Сповільнюємо привида, щоб Пакмен міг його наздогнати
    this._vulnerableTimeLeft = this._vulnerabilityDuration; // Скидаємо таймер вразливості на максимальне значення
    this._blink = false; // Вимикаємо блимання

    // За класикою, привид миттєво розвертається
    this.setDirection(this._getOppositeDirection(this.getDirection()));
  }
};

// Запускає режим повернення на базу після поїдання
Ghost.prototype.runHome = function () {
  this._state = GHOST_STATE_RUN_HOME;
  this.setCurrentSpeed(GHOST_SPEED_FAST);
  this._wayPoints = this._scene.getWaypointsToLairForGhost(this); // Прокладаємо маршрут, щоб отримати покроковий план повернення
  this._currentWaypoint = this._wayPoints.shift(); // Визначаємо першу точку на маршруті
  this.setPosition(this._currentWaypoint); // Миттєво переміщуємо привида на першу точку шляху, щоб вирівняти його по сітці.
};

// Малює привида на canvas.
Ghost.prototype.draw = function (ctx) {
  if (!this._visible) { return; }
  var x = this._scene.getX() + this.getX();
  var y = this._scene.getY() + this.getY();
  // Тіло не малюється, коли привид повертається додому (лише очі)
  if (this._state != GHOST_STATE_RUN_HOME) {
    var bodyFrameKey = this.getCurrentBodyFrame();
    ctx.drawImage(ImageManager.getImage(bodyFrameKey), x, y);
  }
  // Очі не малюються, коли привид вразливий
  if (this._state != GHOST_STATE_VULNERABLE) {
    ctx.drawImage(ImageManager.getImage(this.getCurrentEyesFrame()), x, y);
  }
};

// Повертає ключ для поточного зображення тіла привида.
Ghost.prototype.getCurrentBodyFrame = function () {
  var index = this._bodyFrames[this._bodyFrame];
  var prefix = this._name;
  if (this._state == GHOST_STATE_VULNERABLE) { prefix = 'vulnerable'; }
  var result = prefix + '_' + index;
  if (this._blink) { result += 'b'; }
  return result;
};

// Повертає ключ для поточного зображення очей привида.
Ghost.prototype.getCurrentEyesFrame = function () { return 'eyes_' + this.getDirection(); };

Ghost.prototype.getRect = function () { return this._sprite.getRect(); };
Ghost.prototype.setDirection = function (direction) { return this._sprite.setDirection(direction); };
Ghost.prototype.getDirection = function () { return this._sprite.getDirection(); };
Ghost.prototype.setCurrentSpeed = function (speed) { this._sprite.setCurrentSpeed(speed); };
Ghost.prototype.getCurrentSpeed = function () { return this._sprite.getCurrentSpeed(); };
Ghost.prototype.setPosition = function (position) { this._sprite.setPosition(position); };
Ghost.prototype.getPosition = function () { return this._sprite.getPosition(); };
Ghost.prototype.getX = function () { return this._sprite.getX(); };
Ghost.prototype.getY = function () { return this._sprite.getY(); };
Ghost.prototype.getLeft = function () { return this._sprite.getLeft(); };
Ghost.prototype.getRight = function () { return this._sprite.getRight(); };
Ghost.prototype.getTop = function () { return this._sprite.getTop(); };
Ghost.prototype.getBottom = function () { return this._sprite.getBottom(); };
Ghost.prototype.getWidth = function () { return this._sprite.getWidth(); };
Ghost.prototype.getHeight = function () { return this._sprite.getHeight(); };
Ghost.prototype.setStartPosition = function (position) { this._sprite.setStartPosition(position); };
Ghost.prototype.getStartPosition = function () { return this._sprite.getStartPosition(); };

// Повертає привида на його стартову позицію і скидає його стан
Ghost.prototype.placeToStartPosition = function () {
  this.makeNormal(); // повертаємо привида у звичайний стан полювання
  this._sprite.placeToStartPosition(); // фізично переміщуємо првиида на початкові координати

  // Якщо стартова позиція вище за ворота (над лігвом), то одразу вважаємо що привид вийшов
  var lairPos = this._scene.getLairPosition();
  
  // Якщо стартова позиція привида ВИЩЕ за ворота лігва...
  if (lairPos && this.getY() < lairPos.y) {
    this._exitedLair = true;  // ...то вважаємо, що він вже на волі і йому не треба проходити процедуру виходу.
  } else {
    this._exitedLair = false; // ...інакше він починає всередині і мусить вийти за стандартною процедурою
  }
};