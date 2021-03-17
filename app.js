const game = document.getElementById('game');
const clickBlocker = document.getElementById('noclick');
const scoreKeeper = document.getElementById('score');
const attemptKeeper = document.getElementById('attempts');
const errorNotif = document.getElementById('notification');
const resetButton = document.getElementById('reset-button');
const winnerButton = document.getElementById('winner-button');
const winnerScreen = document.getElementById('winner');

const gameSize = 16;
const rowSize = Math.sqrt(gameSize);
const colors = gameSize / 2;
const colorArr = [];
const matchReward = 50;

const genColorNum = i => {
  return (i * (360 / colors)) % 360;
};

let counter = 0;
let gamePieces = [];

// shuffle the array
const shuffle = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

// generate the board
const genBoard = () => {
  for (let i = 0; i < rowSize; i++) {
    const row = document.createElement('div');
    row.classList.add('row');
    row.setAttribute('id', `row${i}`);

    for (let j = 0; j < rowSize; j++) {
      const square = document.createElement('div');
      // square.innerHTML = `#${counter}`; // for debugging
      square.classList.add('game-square', 'inactive');
      square.setAttribute('id', `piece${i * rowSize + j}`);
      square.onclick = () => {
        square.classList.remove('inactive');
        checkMove(Number(i * rowSize + j));
      };
      row.appendChild(square);
      gamePieces.push(counter);
      counter++;
    }
    game.appendChild(row);
  }
  shuffle(gamePieces);
  const newPieces = gamePieces.reduce((prv, crv, i, arr) => {
    if (i % 2 === 0) {
      prv.push(arr.slice(i, i + 2));
    }
    return prv;
  }, []);

  gamePieces = newPieces;

  // generate a color set for the pieces
  gamePieces.forEach((value, index) => {
    const color = genColorNum(index);
    gamePieces[index].forEach((value2, index2) => {
      document.getElementById(
        `piece${value2}`
      ).style.backgroundColor = `hsl(${color}, 100%, 50%)`;
    });
  });
};

genBoard();

// variables

const gameObj = {
  secondAttempt: false, // checkSelected
  lastSquaresPair: null, // lastCheck
  lastSquaresId: null, // lastPieceId
  currentSquarePair: null,
  currentSquareId: null,
  matchPoints: 0, // score
  attempts: 0,
  score: 0, // totalScore
  matchesSoFar: 0
};

const resetGame = () => {
  gameObj.secondAttempt = false;
  gameObj.lastSquaresPair = null;
  gameObj.lastSquaresId = null;
  gameObj.currentSquarePair = null;
  gameObj.currentSquareId = null;
  gameObj.matchPoints = 0;
  gameObj.attempts = 0;
  gameObj.score = 0;
  gameObj.matchesSoFar = 0;

  for (let i = 0; i < gameSize; i++) {
    let currentDiv = document.getElementById(`piece${i}`);
    currentDiv.classList.remove('finished');
    currentDiv.classList.remove('matched');
    currentDiv.classList.add('inactive');
  }

  winnerScreen.classList.add('hidden');

  scoreKeeper.innerHTML = 0;
  attemptKeeper.innerHTML = 0;
  gamePieces = [];
  counter = 0;
  const allRows = document.querySelectorAll('.row');
  allRows.forEach(row => row.remove());
  genBoard();
};

resetButton.addEventListener('click', resetGame);
winnerButton.addEventListener('click', resetGame);

const updateScore = () => {
  gameObj.score = gameObj.matchPoints * (25 / (gameObj.attempts + 1));
  scoreKeeper.innerHTML = Math.floor(gameObj.score);
  attemptKeeper.innerHTML = gameObj.attempts;
};

const blockClicks = ms => {
  clickBlocker.classList.add('blocker');

  setTimeout(ms => {
    clickBlocker.classList.remove('blocker');
  }, ms);
};

const notification = ms => {
  errorNotif.classList.remove('hidden');

  setTimeout(ms => {
    errorNotif.classList.add('hidden');
  }, ms);
};

const checkWinState = () => {
  if (gameObj.matchesSoFar >= gameSize / 2) {
    console.log('game won');
    setTimeout(() => {
      winnerScreen.classList.remove('hidden');
    }, 1000);
  }
};

// need to check if the two match, if they do, keep them, if not, flip them back over.
const checkMove = square => {
  // find the pair that the current picked square belongs to
  for (let i = 0; i < gamePieces.length; i++) {
    if (gamePieces[i].includes(square)) {
      gameObj.currentSquarePair = i;
      gameObj.currentSquareId = square;
    }
  }

  const currentPiece = document.getElementById(`piece${gameObj.currentSquareId}`);
  const previousPiece = document.getElementById(`piece${gameObj.lastSquaresId}`);
  const toast = document.querySelector('.match-made');

  // if they click the same square twice
  if (gameObj.currentSquareId === gameObj.lastSquaresId) {
    blockClicks(1500);
    notification(1500);
    gameObj.currentSquareId = null;
    gameObj.currentSquarePair = null;
    return;
  }

  if (
    gameObj.lastSquaresPair === gameObj.currentSquarePair &&
    gameObj.secondAttempt === true
  ) {
    // match made!
    blockClicks(1500);
    gameObj.matchesSoFar++;
    gameObj.matchPoints = gameObj.matchPoints + matchReward;
    updateScore();
    toast.classList.add('match-made-toast');

    currentPiece.classList.add('finished');
    previousPiece.classList.add('finished');

    setTimeout(() => {
      toast.classList.remove('match-made-toast');
      previousPiece.classList.add('matched');
      currentPiece.classList.add('matched');
    }, 1000);

    gameObj.secondAttempt = false;
    // reset pair tracker
    gameObj.lastSquaresPair = null;
    gameObj.currentSquarePair = null;
    // reset square id tracker
    gameObj.lastSquaresId = null;
    gameObj.currentSquareId = null;

    // check if they won
    checkWinState();
  } else if (
    gameObj.lastSquaresPair !== gameObj.currentSquarePair &&
    gameObj.secondAttempt === true
  ) {
    // they already clicked one square, this is their second click and it does not match
    blockClicks(1000);
    gameObj.attempts++;
    updateScore();

    gameObj.secondAttempt = false;
    // reset pair tracker
    gameObj.lastSquaresPair = null;
    gameObj.currentSquarePair = null;
    // reset square id tracker
    gameObj.lastSquaresId = null;
    gameObj.currentSquareId = null;

    setTimeout(() => {
      currentPiece.classList.add('inactive');
      previousPiece.classList.add('inactive');
    }, 1000);
  } else if (gameObj.secondAttempt === false) {
    // their first click
    // updateScore();
    gameObj.secondAttempt = true;
    gameObj.lastSquaresPair = gameObj.currentSquarePair;
    gameObj.lastSquaresId = square;

    gameObj.currentSquarePair = null;
    gameObj.currentSquareId = null;
  }
};
