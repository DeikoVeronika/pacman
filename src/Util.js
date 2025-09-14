// Повертає випадковий елемент з масиву
function getRandomElementFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Повертає випадкове ціле число в діапазоні [min, max] (включно).
 */
function getRandomInt(min, max) {  
  return Math.floor(Math.random() * (max - min + 1)) + min;  
}
