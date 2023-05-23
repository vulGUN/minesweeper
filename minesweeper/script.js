const { body } = document;
body.innerHTML += `
<header class="header">
    <nav>
      <ul class="header__wrapper">
        <li class="level">
          <div class="level__title">level:</div>
          <select name="level" id="level-select">
            <option value="easy" selected>easy</option>
            <option value="middle">middle</option>
            <option value="hard">hard</option>
          </select>
        </li>
        <li class="theme">
          <div class="theme__title">Theme:</div>
          <button class="theme__btn dark-mode inactive"><img src="./assets/img/moon-solid.svg" alt="moon"></button>
          <button class="theme__btn light-mode"><img src="./assets/img/sun-solid.svg" alt="sun"></button>
        </li>
        <li class="bomb">
          <div class="bomb__title">bomb:</div>
          <input id="bomb__input" type="range" value="10" min="10" max="99">
          <div class="bomb__current-count">10</div>
        </li>
      </ul>
    </nav>
  </header>
`;
body.innerHTML += '<h1 class="title">Minesweeper</h1>';
body.innerHTML += '<div class="menu"></div>';
body.innerHTML += '<section class="field"></section>';
const field = document.querySelector('.field');
const menu = document.querySelector('.menu');
const inputLevel = document.querySelector('#level-select');
const bombInput = document.querySelector('#bomb__input');
const bombCurentCount = document.querySelector('.bomb__current-count');

const newGameBtn = document.createElement('button');
newGameBtn.classList.add('menu__new-game-btn');
newGameBtn.innerText = 'New game';
menu.insertAdjacentElement('beforeend', newGameBtn);

const time = document.createElement('div');
time.classList.add('menu__time');
time.innerText = 'Time: 00:00';
menu.insertAdjacentElement('beforeend', time);

const steps = document.createElement('div');
steps.classList.add('menu__steps');
steps.innerText = 'Steps: 0';
menu.insertAdjacentElement('beforeend', steps);

const level = {
  easy: 10,
  middle: 15,
  hard: 25,
};

const audioUrls = ['./assets/audio/crash.mp3', './assets/audio/flag.mp3', './assets/audio/lose.mp3', './assets/audio/snap.mp3', './assets/audio/win.mp3'];
let bombIndex = [];
let bombs = [];
let boardSize = level.easy;
let mineCount = bombInput.value;
let stepCounter = 0;
let closeCellCount = boardSize ** 2;
let endGame = false;
let playTime = 1;
let endTime = '00:00';
let timer;
let timerActive = false;
let flagCounter = 0;
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

clearBoardSize();
initBoard(boardSize);

let buttons = [...document.querySelectorAll('.field__button')];

// запуск новой игры
function startNewGame() {
  clearInterval(timer);
  buttons = [...document.querySelectorAll('.field__button')];
  buttons.forEach((i) => {
    i.classList.remove(...i.classList);
    i.classList.add('field__button');
    i.textContent = '';
  });
  stepCounter = 0;
  mineCount = bombInput.value;
  closeCellCount = boardSize ** 2;
  endGame = false;
  playTime = 1;
  endTime = 0;
  timerActive = false;
  firstMove = false;
  flagCounter = 0;
  activeButtons(buttons);
  activeButtons(buttons);
  generateBombs();
  steps.innerText = `Steps: 0`;
  time.innerText = `Time: 00:00`;
  const endTitle = document.querySelector('.end-title');
  if (endTitle) endTitle.remove();
}

// установка размеров поля в зависимости от сложности
function clearBoardSize() {
  field.innerHTML = '';
  field.classList.add('field');
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
  if (inputLevel.value === 'easy') {
    cellWidth = 400 / boardSize;
    fieldWidth = boardSize * cellWidth;
  } else if (inputLevel.value === 'middle') {
    cellWidth = 600 / boardSize;
    fieldWidth = boardSize * cellWidth;
  } else if (inputLevel.value === 'hard') {
    cellWidth = 1000 / boardSize;
    fieldWidth = boardSize * cellWidth;
  }
  if (window.innerWidth <= 430 && inputLevel.value === 'easy') {
    cellWidth = (window.innerWidth - 42) / boardSize;
    fieldWidth = window.innerWidth - 42;
  }
  if (window.innerWidth <= 645 && inputLevel.value === 'middle') {
    cellWidth = (window.innerWidth - 42) / boardSize;
    fieldWidth = window.innerWidth - 42;
  }
  if (window.innerWidth <= 1050 && inputLevel.value === 'hard') {
    cellWidth = (window.innerWidth - 42) / boardSize;
    fieldWidth = window.innerWidth - 42;
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
    const html = `<div class="end-title">Hooray! You found all mines in ${playTime - 1} seconds and ${stepCounter} moves!</div>`;
    body.insertAdjacentHTML('afterend', html);
    clearInterval(timer);
  }
}

function timeInterval() {
  let sec = Math.round(playTime) % 60,
    min = Math.floor(playTime / 60);
  endTime = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  time.innerText = `Time: ${endTime}`;

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

function activeButtons(btns) {
  btns.forEach((i, index) => {
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
      console.log('ok');
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
}

activeButtons(buttons);
generateBombs();

window.addEventListener('resize', resizeWidth);
window.addEventListener('load', resizeWidth);
newGameBtn.addEventListener('click', startNewGame);

const darkMode = document.querySelector('.dark-mode');
const lightMode = document.querySelector('.light-mode');

function activeLightMode() {
  darkMode.classList.add('inactive');
  lightMode.classList.remove('inactive');

  const root = document.documentElement;
  root.style.setProperty('--body-color', '#ececec');
  root.style.setProperty('--text-color', '#242424');

  localStorage.setItem('theme', 'light');
}

function activeDarkMode() {
  lightMode.classList.add('inactive');
  darkMode.classList.remove('inactive');

  const root = document.documentElement;

  root.style.setProperty('--body-color', '#242424');
  root.style.setProperty('--text-color', '#ececec');

  localStorage.setItem('theme', 'dark');
}

darkMode.addEventListener('click', activeLightMode);
lightMode.addEventListener('click', activeDarkMode);

function getLocalStorage() {
  if (localStorage.getItem('theme') === 'dark') {
    activeDarkMode();
  } else {
    activeLightMode();
  }
}

window.addEventListener('load', getLocalStorage);

inputLevel.addEventListener('change', (e) => {
  switch (e.target.value) {
    case 'easy':
      boardSize = level.easy;
      resizeWidth();
      clearBoardSize();
      initBoard(boardSize);
      startNewGame();
      break;
    case 'middle':
      boardSize = level.middle;
      resizeWidth();
      clearBoardSize();
      initBoard(boardSize);
      startNewGame();
      break;
    case 'hard':
      boardSize = level.hard;
      resizeWidth();
      clearBoardSize();
      initBoard(boardSize);
      startNewGame();
      break;
    default:
      boardSize = level.easy;
      resizeWidth();
      clearBoardSize();
      initBoard(boardSize);
      startNewGame();
  }
});

bombInput.addEventListener('input', () => {
  bombCurentCount.innerText = bombInput.value;
});
bombInput.addEventListener('change', () => {
  startNewGame();
});
