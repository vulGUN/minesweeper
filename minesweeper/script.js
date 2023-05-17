const { body } = document;
body.innerHTML = '<section class="field"></section>';
const field = document.querySelector('.field');

const level = {
  easy: [10, 10],
  middle: [15, 25],
  hard: [25, 99],
};

let [boardSize, mineCount] = level.easy;

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

  let buttons = [...document.querySelectorAll('.field__button')];
  buttons.forEach((i, index) => {
    i.addEventListener('click', (e) => {
      const row = Math.floor(index / boardSize);
      const col = index % boardSize;

      e.target.classList.add('field__button_active');
      isBomb(index, indexBombs, i);
      console.log(+`${row}${col}`);
    });
  });

  const indexBombs = generateBomb();
  console.log(indexBombs);
}

setBoardSize(boardSize);
init(boardSize);

function generateBomb() {
  const bombArr = [];
  for (let i = 0; i < mineCount; i++) {
    const randomNum = Math.floor(Math.random() * boardSize ** 2);
    if (bombArr.includes(randomNum)) i -= 1;
    else bombArr.push(randomNum);
  }
  return bombArr;
}

function isBomb(index, indexBomb, el) {
  if (indexBomb.includes(index)) {
    el.classList.add('bomb_active');
  }
}

// switch (el.textContent) {
//   case '1':
//     el.style.color = 'blue';
//     break;
//   case '2':
//     el.style.color = 'green';
//     break;
//   case '3':
//     el.style.color = 'red';
//     break;
//   case '4':
//     el.style.color = 'darkblue';
//     break;
//   case '5':
//     el.style.color = 'orange';
//     break;
// }
