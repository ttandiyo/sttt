import { useState, useMemo } from "react";
import useSound from "use-sound";
import popSfx from "./assets/pop1.wav";

const BOARD_HEIGHT = 6;
const BOARD_WIDTH = 6;
const WIN_LINE_LEN = 3;
const NUM_PLAYERS = 2;
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
// TODO: assert WIN_LINE_LEN <= BOARD_HEIGHT or BOARD_WIDTH

// TODO: UI for adjusting rules
// TODO: CPU player (ML would be cool)

function calcScore(squares: number[][], player: number) {
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

  // Check diagonals

  // Generate an array of starting coordinates
  const downRightStartCoords = [];
  const downLeftStartCoords = [];

  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    // TODO: Remove diagonals that are too short for a win line
    downRightStartCoords.push([x, 0]);
    downLeftStartCoords.push([x, 0]);
  }
  for (let y = 1; y < BOARD_HEIGHT; y += 1) {
    // y=1 so we don't check origin diagonals again
    // TODO: Remove diagonals that are too short for a win line
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

function checkGameOver(squares: number[][]) {
  for (let x = 0; x < BOARD_HEIGHT; x += 1) {
    for (let y = 0; y < BOARD_WIDTH; y += 1)
      if (squares[x][y] === 0) {
        return false;
      }
  }
  return true;
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

// 0: no winner; -1: tie; n>0: winner's player number
// TODO: make more elegant
function State({ winner }: StateProps) {
  let text = "";
  if (winner > 0) {
    text = `${winner} wins!`;
  } else if (winner === -1) {
    text = "It's a tie!";
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
  avatars: string[];
  scores: number[];
}

function ScoreBoard({ avatars, scores }: ScoreBoardProps) {
  return (
    <div className="scoreboard">
      <div className="player1-score">
        <h1>
          {avatars[0]} {scores[0]}
        </h1>
      </div>
      <div className="player1-score">
        <h1>
          {avatars[1]} {scores[1]}
        </h1>
      </div>
    </div>
  );
}

interface AvatarSelectorProps {
  avatars: string[];
  avatarChoices: string[];
  setAvatars: (avatars: string[]) => void;
}

function AvatarSelector({
  avatars,
  setAvatars,
  avatarChoices,
}: AvatarSelectorProps) {
  return (
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
}

export function Board() {
  // React uses these state variables to maintain state between renders
  // Local variables are lost on every re-render, and changes to local variables don't trigger renders
  const initCurrentPlayer = 1;
  const initSquares = Array(BOARD_WIDTH).fill(Array(BOARD_HEIGHT).fill(0));
  const initWinner = 0;
  const initScores = [0, 0];

  const [currentPlayer, setCurrentPlayer] = useState<number>(initCurrentPlayer);
  const [squares, setSquares] = useState<number[][]>(initSquares);
  const [winner, setWinner] = useState<number>(initWinner);
  const [scores, setScores] = useState<number[]>(initScores);
  const [playPopSfx] = useSound(popSfx);
  const [avatars, setAvatars] = useState(["🐻", "🐼"]);

  function resetState() {
    setCurrentPlayer(initCurrentPlayer);
    setSquares(initSquares);
    setWinner(initWinner);
    setScores(initScores);
  }

  function nextPlayer() {
    let nextPlayer = currentPlayer + 1;
    if (nextPlayer > NUM_PLAYERS) {
      nextPlayer = 1;
    }
    setCurrentPlayer(nextPlayer);
  }

  function currentPlayerAvatar() {
    return avatars[currentPlayer - 1];
  }

  function calcWinner() {
    if (scores[0] > scores[1]) {
      return 1;
    } else if (scores[1] > scores[0]) {
      return 2;
    } else {
      return -1;
    }
  }

  function handleClick(x: number, y: number) {
    if (squares[x][y]) {
      console.log(`Square ${x}, ${y} already occupied.`);
      return;
    }

    const nextSquares = squares.map((row) => [...row]); // make a deep copy of the squares array
    nextSquares[x][y] = currentPlayer; // try using useEffect: calls function whenever a state variable is updated (apparently bad practice)
    setSquares(nextSquares); // React setState methods are asynchronous, update isn't guaranteed immediately
    setScores([calcScore(nextSquares, 1), calcScore(nextSquares, 2)]); // todo: only need to calc score for current player

    playPopSfx();

    if (checkGameOver(nextSquares)) {
      setWinner(calcWinner());
      // TODO: Stop game
    }

    nextPlayer();
  }

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
      <ScoreBoard avatars={avatars} scores={scores} />
      <AvatarSelector
        avatars={avatars}
        avatarChoices={avatarChoices}
        setAvatars={setAvatars}
      />
      <p>It's {currentPlayerAvatar()}'s turn.</p>
      <State winner={winner} />
      <button type="button" className="reset" onClick={resetState}>
        Reset
      </button>
      {boardElements}
    </>
  );
}
