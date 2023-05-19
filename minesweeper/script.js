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
const bombs = [];
let stepCounter = 0;
let closeCellCount = boardSize ** 2;
let endGame = false;
let playTime = 1;
let endTime = 0;
let timer;
let timerActive = false;
const audioUrls = ['./assets/audio/crash.mp3', './assets/audio/flag.mp3', './assets/audio/lose.mp3', './assets/audio/snap.mp3', './assets/audio/win.mp3'];

function preloadAudio(urls) {
  urls.forEach(function (url) {
    var audio = new Audio();
    audio.src = url;
    audio.load();
  });
}

preloadAudio(audioUrls);

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
  closeCellCount--;

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

function lose() {
  for (let i = 0; i < mineCount; i++) {
    const index = bombIndex[i][0] * boardSize + bombIndex[i][1];
    const cell = document.querySelectorAll('.field__button')[index];
    if (!cell.classList.contains('bomb_active')) {
      cell.classList.add('bomb_inactive', 'field__button_active');
      cell.classList.remove('flag_active');
    }
  }
  endGame = true;
  const html = `<div class="end-title">Game over. Try again</div>`;
  body.insertAdjacentHTML('afterend', html);
  clearInterval(timer);
  playLoseAudio();
}

function win() {
  if (closeCellCount <= mineCount && endGame === false) {
    endGame = true;
    const html = `<div class="end-title">Hooray! You found all mines in ${playTime} seconds and ${stepCounter} moves!</div>`;
    body.insertAdjacentHTML('afterend', html);
    clearInterval(timer);
    playWinAudio();
  }
}

function timeInterval() {
  let sec = Math.round(playTime) % 60,
    min = Math.floor(playTime / 60);
  endTime = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

  if (playTime < 3599) playTime++;
}

function playWinAudio() {
  const audio = new Audio('./assets/audio/win.mp3');
  audio.play();
}

function playLoseAudio() {
  const audioLose = new Audio('./assets/audio/lose.mp3');
  const audioCrash = new Audio('./assets/audio/crash.mp3');
  audioCrash.play();
  audioLose.play();
}

function playSnapAudio() {
  const audio = new Audio('./assets/audio/snap.mp3');
  audio.play();
}

function playFlagAudio() {
  const audio = new Audio('./assets/audio/flag.mp3');
  audio.play();
}

setBoardSize(boardSize);
init(boardSize);

const buttons = [...document.querySelectorAll('.field__button')];
buttons.forEach((i, index) => {
  const leftClick = function () {
    if (!i.classList.contains('flag_active') && !endGame) {
      const row = Math.floor(index / boardSize);
      const col = index % boardSize;

      if (!timerActive) {
        timer = setInterval(timeInterval, 1000);
        timerActive = true;
      }

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
    if (!i.classList.contains('field__button_active') && endGame === false) {
      i.classList.toggle('flag_active');
      playFlagAudio();
    }
  };

  i.addEventListener('click', () => {
    if (!i.classList.contains('field__button_active') && endGame === false) {
      ++stepCounter;
      i.classList.contains('flag_active') ? null : playSnapAudio();
    }
    leftClick();
    win();
  });
  i.addEventListener('dblclick', dblclick);
  i.addEventListener('contextmenu', rightClick);
});

generateBombs();

window.addEventListener('resize', resizeWidth);
window.addEventListener('load', resizeWidth);
