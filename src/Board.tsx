import { useState } from "react";
import useSound from "use-sound";
import popSfx from "./assets/pop1.wav";

const BOARD_HEIGHT = 5;
const BOARD_WIDTH = 5;
const WIN_LINE_LEN = 3;
// const PLAYERS = [1, 2];

// TODO: assert WIN_LINE_LEN <= BOARD_HEIGHT or BOARD_WIDTH
// TODO: UI for adjusting rules
// TODO: CPU player (ML would be cool)

// class Array2D {
//   constructor(height, width) {
//     this.width = width;
//     this.array = Array(height * width).fill(null);
//   }

//   get(x, y) {
//     return this.array[y * this.width + x];
//   }

//   set(x, y, value) {
//     this.array[y *]
//   }
// }

// function genWinLines() {
//   const winLines = [];

//   // Horizontals
//   for (let y = 0; y < BOARD_HEIGHT; y += 1) {
//     winLines.push(
//       Array.from({ length: BOARD_WIDTH }, (v, i) => y * BOARD_HEIGHT + i)
//     );
//   }

//   // Verticals
//   for (let x = 0; x < BOARD_WIDTH; x += 1) {
//     winLines.push(
//       Array.from({ length: BOARD_HEIGHT }, (v, i) => x + BOARD_WIDTH * i)
//     );
//   }
//   return winLines;
// }

function calcScore(squares: any[][], player: number) {
  let score = 0;
  // Might be better to make a boolean matrix of some kind?
  // Check horizontals
  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    let maxLineLen = 0;
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      maxLineLen = squares[x][y] === player ? maxLineLen + 1 : 0;
      if (maxLineLen >= WIN_LINE_LEN) {
        score += 1;
        maxLineLen -= 1;
      }
    }
  }

  // Check verticals
  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    let maxLineLen = 0;
    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
      maxLineLen = squares[x][y] === player ? maxLineLen + 1 : 0;
      if (maxLineLen >= WIN_LINE_LEN) {
        score += 1;
        maxLineLen -= 1;
      }
    }
  }

  // TODO: check diagonals
  // Do some math to check which diagonals are even possible

  // Dumb brute force solution

  // Generate an array of starting coordinates
  const downRightStartCoords = [];
  const downLeftStartCoords = [];

  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    downRightStartCoords.push([x, 0]);
    downLeftStartCoords.push([x, 0]);
  }
  for (let y = 1; y < BOARD_HEIGHT; y += 1) {
    // y=1 so we don't check origin diagonals again
    downRightStartCoords.push([0, y]);
    downLeftStartCoords.push([BOARD_WIDTH - 1, y]);
  }

  // Check down-right direction
  for (const startCoord of downRightStartCoords) {
    let x = startCoord[0];
    let y = startCoord[1];
    let maxLineLen = 0;
    while (x < BOARD_WIDTH && y < BOARD_HEIGHT) {
      maxLineLen = squares[x][y] === player ? maxLineLen + 1 : 0;
      if (maxLineLen >= WIN_LINE_LEN) {
        score += 1;
        maxLineLen -= 1;
      }
      x += 1;
      y += 1;
    }
  }

  // Check down-left direction
  for (const startCoord of downLeftStartCoords) {
    let x = startCoord[0];
    let y = startCoord[1];
    let maxLineLen = 0;
    while (x >= 0 && y < BOARD_HEIGHT) {
      maxLineLen = squares[x][y] === player ? maxLineLen + 1 : 0;
      if (maxLineLen >= WIN_LINE_LEN) {
        score += 1;
        maxLineLen -= 1;
      }
      x -= 1;
      y += 1;
    }
  }

  return score;
}

interface SquareProps {
  value: string;
  onSquareClick: () => void;
}

function Square({ value, onSquareClick }: SquareProps) {
  return (
    <button type="button" className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

interface StateProps {
  winner: number;
}

function State({ winner }: StateProps) {
  let text = "";
  if (winner) {
    text = `${winner} wins!`;
  } else {
    text = "No winner yet.";
  }

  return (
    <div className="status">
      <p>{text}</p>
    </div>
  );
}

interface ScoreBoardProps {
  scores: number[];
}

function ScoreBoard({ scores }: ScoreBoardProps) {
  return (
    <div className="scoreboard">
      <div className="player1-score">
        <h1>Player 1: {scores[0]}</h1>
      </div>
      <div className="player1-score">
        <h1>Player 2: {scores[1]}</h1>
      </div>
    </div>
  );
}

export function Board() {
  // React uses these state variables to maintain state between renders
  // Local variables are lost on every re-render, and changes to local variables don't trigger renders
  const initIsXTurn = true;
  const initSquares = Array(BOARD_WIDTH).fill(Array(BOARD_HEIGHT).fill(0));
  const initWinner = 0;
  const initScores = [0, 0];
  const [playPopSfx] = useSound(popSfx);

  const [isXTurn, setIsXTurn] = useState<boolean>(initIsXTurn);
  const [squares, setSquares] = useState<number[][]>(initSquares);
  const [winner, setWinner] = useState<number>(initWinner);
  const [scores, setScores] = useState<number[]>(initScores);

  // let isXTurn = initIsXTurn;
  // let squares = initSquares;
  // let winner = initWinner;
  // let scores = initScores;

  function resetState() {
    setIsXTurn(initIsXTurn);
    setSquares(initSquares);
    setWinner(initWinner);
    setScores(initScores);
    // isXTurn = initIsXTurn;
    // squares = initSquares;
    // winner = initWinner;
    // scores = initScores;
  }

  function handleClick(x: number, y: number) {
    if (squares[x][y]) {
      console.log(`Square ${x}, ${y} already occupied.`);
      return;
    }

    const currentPlayer = isXTurn ? 1 : 2;
    // const nextSquares = squares.slice();
    const nextSquares = squares.map((row) => [...row]); // make a deep copy of the squares array
    nextSquares[x][y] = currentPlayer; // try using useEffect: calls function whenever a state variable is updated
    setSquares(nextSquares); // React setState methods are asynchronous, update isn't guaranteed immediately
    // squares = nextSquares;

    // if (calcScore(nextSquares, currentPlayer)) {
    //   // So use nextSquares instead of squares for check
    //   setWinner(currentPlayer);
    //   // TODO: Stop game
    // }

    setScores([calcScore(nextSquares, 1), calcScore(nextSquares, 2)]);
    // scores = [calcScore(nextSquares, 1), calcScore(nextSquares, 2)];

    playPopSfx();

    setIsXTurn(!isXTurn);
    // isXTurn = !isXTurn;
  }

  // Avatar selection
  const [avatars, setAvatars] = useState(["🐻", "🐼"]);
  const avatarChoices = [
    "🐻",
    "🐼",
    "🐸",
    "🐵",
    "🐧",
    "🐢",
    "🐛",
    "🐞",
    "🐰",
    "🥝",
  ];

  const avatarSelector = (
    <div className="avatar-selector">
      <label htmlFor="player1-avatar">Player 1:</label>
      <select
        name="player1-avatar"
        onChange={(e) => setAvatars([e.target.value, avatars[1]])}
        value={avatars[0]}
      >
        {avatarChoices.map((avatar, index) => (
          <option key={index} value={avatar}>
            {avatar}
          </option>
        ))}
      </select>

      <label htmlFor="player2-avatar">Player 2:</label>
      <select
        name="player2-avatar"
        onChange={(e) => setAvatars([avatars[0], e.target.value])}
        value={avatars[1]}
      >
        {avatarChoices.map((avatar, index) => (
          <option key={index} value={avatar}>
            {avatar}
          </option>
        ))}
      </select>
    </div>
  );

  const boardElements = [];
  // TODO: Use a nested map to generate grid
  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    const rowElements = [];
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      let avatar = "";
      if (squares[x][y] === 1) {
        avatar = avatars[0];
      } else if (squares[x][y] === 2) {
        avatar = avatars[1];
      }
      rowElements.push(
        <Square
          value={avatar}
          onSquareClick={() => handleClick(x, y)}
          key={y * BOARD_WIDTH + x}
        />
      );
    }
    boardElements.push(
      <div className="board-row" key={y}>
        {rowElements}
      </div>
    );
  }

  // console.log(genWinLines());

  return (
    <>
      <ScoreBoard scores={scores} />

      {boardElements}
      <State winner={winner} />
      {avatarSelector}
      <button type="button" className="reset" onClick={resetState}>
        Reset
      </button>
    </>
  );
}
