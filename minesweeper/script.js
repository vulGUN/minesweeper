const { body } = document;
body.innerHTML += '<h1 class="title">Minesweeper</h1>';
body.innerHTML += '<div class="menu"></div>';
body.innerHTML += '<section class="field"></section>';
const field = document.querySelector('.field');
const menu = document.querySelector('.menu');

const newGameBtn = document.createElement('button');
newGameBtn.classList.add('menu__new-game-btn');
newGameBtn.innerText = 'New game';
menu.insertAdjacentElement('beforeend', newGameBtn);

const time = document.createElement('div');
time.classList.add('menu__time');
time.innerText = 'Timer: 00:00';
menu.insertAdjacentElement('beforeend', time);

const steps = document.createElement('div');
steps.classList.add('menu__steps');
steps.innerText = 'Steps: 0';
menu.insertAdjacentElement('beforeend', steps);

const level = {
  easy: [10, 10],
  middle: [15, 25],
  hard: [25, 99],
};

const audioUrls = ['./assets/audio/crash.mp3', './assets/audio/flag.mp3', './assets/audio/lose.mp3', './assets/audio/snap.mp3', './assets/audio/win.mp3'];
let bombIndex = [];
let bombs = [];
let [boardSize, mineCount] = level.easy;
let stepCounter = 0;
let closeCellCount = boardSize ** 2;
let endGame = false;
let playTime = 0;
let endTime = '00:00';
let timer;
let timerActive = false;
let longPressTimer;
let firstMove = false;
const durationThreshold = 1000;

// предзагрузка звуков, чтобы срабатывали без задержек
function preloadAudio(urls) {
  urls.forEach(function (url) {
    let audio = new Audio();
    audio.src = url;
    audio.load();
  });
}

preloadAudio(audioUrls);

setBoardSize(boardSize);
initBoard(boardSize);

const buttons = [...document.querySelectorAll('.field__button')];

// запуск новой игры
function startNewGame() {
  clearInterval(timer);
  buttons.forEach((i) => {
    i.classList.remove(...i.classList);
    i.classList.add('field__button');
    i.textContent = '';
  });
  generateBombs();
  stepCounter = 0;
  closeCellCount = boardSize ** 2;
  endGame = false;
  playTime = 1;
  endTime = 0;
  timerActive = false;
  firstMove = false;
  steps.innerText = `Steps: 0`;
  time.innerText = `Timer: 00:00`;
  const endTitle = document.querySelector('.end-title');
  endTitle.remove();
}

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

function initBoard(boardSize) {
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
  bombIndex = [];
  bombs = [];
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
  playLoseAudio();
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
}

function win() {
  if (closeCellCount <= mineCount && endGame === false) {
    playWinAudio();
    endGame = true;
    const html = `<div class="end-title">Hooray! You found all mines in ${playTime} seconds and ${stepCounter} moves!</div>`;
    body.insertAdjacentHTML('afterend', html);
    clearInterval(timer);
  }
}

function timeInterval() {
  let sec = Math.round(playTime) % 60,
    min = Math.floor(playTime / 60);
  endTime = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  time.innerText = `Timer: ${endTime}`;

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

buttons.forEach((i, index) => {
  const leftClick = function () {
    if (!i.classList.contains('flag_active') && !endGame) {
      const row = Math.floor(index / boardSize);
      const col = index % boardSize;

      if (!timerActive) {
        timer = setInterval(timeInterval, 1000);
        timerActive = true;
      }

      if (bombs[row][col] && !firstMove) {
        generateBombs();
        leftClick();
      } else if (bombs[row][col] && firstMove) {
        i.classList.add('bomb_active', 'field__button_active');
        lose();
      } else {
        openCell(row, col);
      }
      firstMove = true;
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

  function startLongPress() {
    longPressTimer = setTimeout(handleLongPress, durationThreshold);
  }

  function endLongPress() {
    clearTimeout(longPressTimer);
  }

  function handleLongPress() {
    if (!i.classList.contains('field__button_active') && endGame === false) {
      i.classList.toggle('flag_active');
    }
  }

  i.addEventListener('touchstart', startLongPress);
  i.addEventListener('touchend', endLongPress);
  i.addEventListener('click', () => {
    if (!i.classList.contains('field__button_active') && endGame === false) {
      ++stepCounter;
      steps.innerText = `Steps: ${stepCounter}`;
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
newGameBtn.addEventListener('click', startNewGame);
