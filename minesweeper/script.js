const { body } = document;
body.innerHTML += '<h1 class="title">Minesweeper</h1>';
body.innerHTML += '<section class="field"></section>';
const field = document.querySelector('.field');

const level = {
  easy: [10, 10],
  middle: [15, 25],
  hard: [25, 99],
};

let [boardSize, mineCount] = level.easy;
const bombIndex = [];

// установка размеров поля в зависимости от сложности
function setBoardSize(boardSize) {
  switch (boardSize) {
    case 10:
      field.classList.remove(...field.classList);
      field.classList.add('field', 'field_easy');
      break;
    case 15:
      field.classList.remove(...field.classList);
      field.classList.add('field', 'field_middle');
      break;
    case 25:
      field.classList.remove(...field.classList);
      field.classList.add('field', 'field_hard');
      break;
  }
}

function init(boardSize) {
  for (let j = 0; j < boardSize ** 2; j++) {
    const cell = document.createElement('button');
    cell.classList.add('field__button');
    field.appendChild(cell);
  }
}

setBoardSize(boardSize);
init(boardSize);

const bombs = [];

const buttons = [...document.querySelectorAll('.field__button')];
buttons.forEach((i, index) => {
  const leftClick = function () {
    if (!i.classList.contains('flag_active') && !i.classList.contains('game-over')) {
      const row = Math.floor(index / boardSize);
      const col = index % boardSize;

      if (bombs[row][col]) {
        i.classList.add('bomb_active', 'field__button_active');
        lose();
      } else {
        openCell(row, col);
      }
    }
  };

  const dblclick = function (e) {
    e.preventDefault();
  };

  const rightClick = function (e) {
    e.preventDefault();
    if (!i.classList.contains('field__button_active')) {
      i.classList.toggle('flag_active');
    }
  };

  i.addEventListener('click', leftClick);
  i.addEventListener('dblclick', dblclick);
  i.addEventListener('contextmenu', rightClick);
});

generateBombs();

function calculateBombCount(row, col) {
  let bombCount = 0;

  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (i >= 0 && i < boardSize && j >= 0 && j < boardSize) {
        if (bombs[i][j]) {
          bombCount++;
        }
      }
    }
  }

  return bombCount;
}

function generateBombs() {
  while (bombIndex.length < mineCount) {
    const randomRow = Math.floor(Math.random() * boardSize);
    const randomCol = Math.floor(Math.random() * boardSize);
    const newBomb = [randomRow, randomCol];
    if (!bombIndex.some((bomb) => bomb[0] === randomRow && bomb[1] === randomCol)) {
      bombIndex.push(newBomb);
    }
  }
  for (let i = 0; i < boardSize; i++) {
    bombs[i] = [];
    for (let j = 0; j < boardSize; j++) {
      bombs[i][j] = false;
    }
  }
  bombIndex.forEach((j) => {
    const [row, col] = j;
    bombs[row][col] = true;
  });
}

function openCell(row, col) {
  const cellIndex = row * boardSize + col;
  const cell = document.querySelectorAll('.field__button')[cellIndex];

  if (cell.classList.contains('field__button_active')) {
    return;
  }

  const bombCount = calculateBombCount(row, col);
  if (bombCount > 0) cell.textContent = bombCount;
  switch (cell.textContent) {
    case '1':
      cell.style.color = 'blue';
      break;
    case '2':
      cell.style.color = 'green';
      break;
    case '3':
      cell.style.color = 'red';
      break;
    case '4':
      cell.style.color = 'darkblue';
      break;
    case '5':
      cell.style.color = 'darkred';
      break;
  }

  cell.classList.add('field__button_active');

  if (bombCount === 0) {
    for (let i = row - 1; i <= row + 1; i++) {
      for (let j = col - 1; j <= col + 1; j++) {
        if (i >= 0 && i < boardSize && j >= 0 && j < boardSize) {
          openCell(i, j);
        }
      }
    }
  }
}

function resizeWidth() {
  const root = document.documentElement;
  let cellWidth, fieldWidth;
  if (window.innerWidth >= 430) {
    cellWidth = 400 / boardSize;
    fieldWidth = boardSize * cellWidth;
  } else {
    cellWidth = (window.innerWidth - 32) / boardSize;
    fieldWidth = window.innerWidth - 32;
  }
  root.style.setProperty('--cell-size', `${cellWidth}px`);
  root.style.setProperty('--field-size', `${fieldWidth}px`);
}

window.addEventListener('resize', resizeWidth);
window.addEventListener('load', resizeWidth);

function lose() {
  for (let i = 0; i < mineCount; i++) {
    const index = bombIndex[i][0] * boardSize + bombIndex[i][1];
    const cell = document.querySelectorAll('.field__button')[index];
    if (!cell.classList.contains('bomb_active')) {
      cell.classList.add('bomb_inactive', 'field__button_active');
      cell.classList.remove('flag_active');
    }
  }
  buttons.forEach((i) => {
    i.classList.add('game-over');
  });
}
