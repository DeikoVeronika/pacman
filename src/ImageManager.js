// Клас ImageManager відповідає за завантаження та зберігання всіх зображень гри
var ImageManager = (function() {
  var images = {
    // --- Зображення стін ---
    wall_h: null,
    wall_v: null,
    wall_tlc: null,
    wall_trc: null,
    wall_blc: null,
    wall_brc: null,
    wall_t: null,
    wall_b: null,
    wall_l: null,
    wall_r: null,
    wall_mt: null,
    wall_mb: null,
    wall_ml: null,
    wall_mr: null,
    // --- Зображення Pacman ---
    pacman_1: null,
    pacman_2l: null,
    pacman_3l: null,
    pacman_2r: null,
    pacman_3r: null,
    pacman_2u: null,
    pacman_3u: null,
    pacman_2d: null,
    pacman_3d: null,
    // --- Анімація смерті Pacman ---
    pacman_dies_1: null,
    pacman_dies_2: null,
    pacman_dies_3: null,
    pacman_dies_4: null,
    pacman_dies_5: null,
    pacman_dies_6: null,
    pacman_dies_7: null,
    pacman_dies_8: null,
    pacman_dies_9: null,
    pacman_dies_10: null,
    pacman_dies_11: null,
    pacman_dies_12: null,
    // --- Зображення привидів ---
    blinky_1: null,
    blinky_2: null,
    pinky_1: null,
    pinky_2: null,
    inky_1: null,
    inky_2: null,
    clyde_1: null,
    clyde_2: null,
    // --- Вразливі привиди ---
    vulnerable_1: null,
    vulnerable_2: null,
    vulnerable_1b: null,
    vulnerable_2b: null,
    // --- Очі привидів ---
    eyes_l: null,
    eyes_r: null,
    eyes_u: null,
    eyes_d: null,
    // --- Кульки ---
    pellet: null,
    power_pellet: null,
    // --- Фрукт ---
    cherry: null
  };
  
  // Завантаження всіх зображень
  for (var i in images) {
    var img = new Image();
    img.src = 'images/' + i + '.png';
    images[i] = img;
  }
  
  return {
    // Повертає зображення за ім'ям
    getImage: function (name) {
      return images[name];
    }
  };
})();
