import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
// useSound's package.json doesn't export types properly yet
// @ts-expect-error
import useSound from "use-sound";
import popSfx from "./assets/sounds/pop1.wav";

import bearAvatar from "./assets/avatars/bear.png";
import catAvatar from "./assets/avatars/cat.png";
import caterpillarAvatar from "./assets/avatars/caterpillar.png";
import cowAvatar from "./assets/avatars/cow.png";
import dogAvatar from "./assets/avatars/dog.png";
import frogAvatar from "./assets/avatars/frog.png";
import ladybugAvatar from "./assets/avatars/ladybug.png";
import monkeyAvatar from "./assets/avatars/monkey.png";
import pandaAvatar from "./assets/avatars/panda.png";
import penguinAvatar from "./assets/avatars/penguin.png";
import rabbitAvatar from "./assets/avatars/rabbit.png";
import tigerAvatar from "./assets/avatars/tiger.png";
import tortoiseAvatar from "./assets/avatars/tortoise.png";

const BOARD_HEIGHT = 6;
const BOARD_WIDTH = 6;
const WIN_LINE_LEN = 3;
const NUM_PLAYERS = 2;

const gridConfigStr = "1fr ".repeat(BOARD_WIDTH);

// const avatarChoices = ["🐻", "🐼", "🐸", "🐵", "🐧", "🐢", "🐞", "🐰", "🥝"];

// const avatarData = {
//   bear: {
//     image: bearAvatar,
//     color: "brown",
//     text: "🐻",
//   },
//   cat: {
//     image: catAvatar,
//     color: "purple",
//     text: "🐱",
//   },
//   caterpillar: {
//     image: caterpillarAvatar,
//     color: "green",
//     text: "🐛",
//   },
//   cow: {
//     image: cowAvatar,
//     color: "yellow",
//     text: "🐮",
//   },
//   dog: {
//     image: dogAvatar,
//     color: "orange",
//     text: "🐶",
//   },
// };

const avatarData = [
  {
    image: bearAvatar,
    color: "brown",
    text: "🐻",
  },
  {
    image: catAvatar,
    color: "purple",
    text: "🐱",
  },
  {
    image: caterpillarAvatar,
    color: "green",
    text: "🐛",
  },
  {
    image: cowAvatar,
    color: "yellow",
    text: "🐮",
  },
  {
    image: dogAvatar,
    color: "orange",
    text: "🐶",
  },
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
    for (let y = 0; y < BOARD_WIDTH; y += 1) {
      if (squares[x][y] === 0) {
        return false;
      }
    }
  }
  return true;
}

interface SquareProps {
  player: number;
  // value: string;
  avatar: { image: string; color: string };
  onSquareClick: () => void;
}

function Square({ player, avatar, onSquareClick }: SquareProps) {
  let playerClassName = "";
  if (player === 1) {
    playerClassName = "player1";
  } else if (player === 2) {
    playerClassName = "player2";
  }
  return (
    <div className={`square ${playerClassName}`} onClick={onSquareClick}>
      {player !== 0 && <img src={avatar.image} className="avatar" alt="" />}
    </div>
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
    <div className="status center-horiz timer">
      <p>{text}</p>
    </div>
  );
}

interface ScoreBoardProps {
  avatars: number[];
  avatarData: { image: string; color: string; text: string }[];
  scores: number[];
}

function ScoreBoard({ avatars, avatarData, scores }: ScoreBoardProps) {
  return (
    <div className="scoreboard">
      <div className="player1-score">
        <h1>
          {avatarData[avatars[0]].text} {scores[0]}
        </h1>
      </div>
      <div className="player2-score">
        <h1>
          {avatarData[avatars[1]].text} {scores[1]}
        </h1>
      </div>
    </div>
  );
}

interface AvatarSelectorProps {
  avatars: number[];
  avatarChoices: { image: string; color: string; text: string }[];
  setAvatars: (avatars: number[]) => void;
}

function AvatarSelector({
  avatars,
  setAvatars,
  avatarChoices,
}: AvatarSelectorProps) {
  const onChangeHandler = (
    selectElement: HTMLSelectElement,
    playerNumber: number,
  ) => {
    const newAvatars = [...avatars];
    newAvatars[playerNumber] = selectElement.selectedIndex;
    setAvatars(newAvatars);
  };

  return (
    <div>
      <div className="avatar-selector">
        <label htmlFor="player1-avatar">Player 1:</label>
        <select
          name="player1-avatar"
          onChange={(e) => onChangeHandler(e.currentTarget, 0)}
          value={avatarChoices[avatars[0]].text}
        >
          {avatarChoices.map((avatar, index) => (
            <option key={index} value={avatar.text}>
              {avatar.text}
            </option>
          ))}
        </select>
      </div>
      <div className="avatar-selector">
        <label htmlFor="player2-avatar">Player 2:</label>
        <select
          name="player2-avatar"
          onChange={(e) => onChangeHandler(e.currentTarget, 1)}
          value={avatarChoices[avatars[1]].text}
        >
          {avatarChoices.map((avatar, index) => (
            <option key={index} value={avatar.text}>
              {avatar.text}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

interface MenuProps {
  handleStart: () => void;
  children?: ComponentChildren;
}

function Menu({ handleStart, children }: MenuProps) {
  return (
    <div className="menu-bg">
      <div className="menu">
        <div className="header center-horiz">
          <div className="logo-square">
            <div className="logo-letter">S</div>
          </div>
          <div className="logo-square">
            <div className="logo-letter">T</div>
          </div>
          <div className="logo-square">
            <div className="logo-letter">T</div>
          </div>
          <div className="logo-square">
            <div className="logo-letter">T</div>
          </div>
        </div>
        <div className="body center-horiz">
          <p>
            Every line of three is one point. <br />
            You have five seconds per move—be quick!
          </p>
        </div>

        {
          /* <div className="player1-setup">
          <div className="player-name">Player 1</div>
          <div className="player-avatar">
            <div className="avatar">
              <img src={bearAvatar} />
            </div>
          </div>
        </div>

        <div className="player2-setup">
          <div className="player-name">Player 2</div>
          <div className="player-avatar">
            <div className="avatar">
              <img src={catAvatar} />
            </div>
          </div>
        </div> */
        }
        {children}

        <div className="center-horiz">
          <button className="start-button" onClick={handleStart}>
            START
          </button>
        </div>
      </div>
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
  const initTimeLeft = 5;

  const [currentPlayer, setCurrentPlayer] = useState<number>(initCurrentPlayer);
  const [squares, setSquares] = useState<number[][]>(initSquares);
  const [winner, setWinner] = useState<number>(initWinner);
  const [scores, setScores] = useState<number[]>(initScores);
  const [playPopSfx] = useSound(popSfx);
  const [avatars, setAvatars] = useState([0, 1]);
  const [paused, setPaused] = useState(true);
  const [timeLeft, setTimeLeft] = useState(initTimeLeft);
  const [gameOver, setGameOver] = useState(false);

  const intervalRef = useRef(0);

  function resetTimer() {
    setTimeLeft(initTimeLeft);
  }

  function decrementTime() {
    // !paused && setTimeLeft(timeLeft - 1);
    if (!paused && !gameOver) {
      if (timeLeft > 1) {
        setTimeLeft(timeLeft - 1);
      } else {
        randomMove();
        resetTimer();
      }
    }
  }

  useEffect(() => {
    intervalRef.current = setInterval(decrementTime, 1000);
    return () => clearInterval(intervalRef.current);
  });

  function randomMove() {
    const nextSquares = squares.map((row) => [...row]); // make a deep copy of the squares array
    let x = 0;
    let y = 0;
    do {
      x = Math.floor(Math.random() * BOARD_WIDTH);
      y = Math.floor(Math.random() * BOARD_HEIGHT);
    } while (!gameOver && nextSquares[x][y] !== 0);

    nextSquares[x][y] = currentPlayer;
    setSquares(nextSquares);
    setScores([calcScore(nextSquares, 1), calcScore(nextSquares, 2)]); // todo: only need to calc score for current player

    playPopSfx();

    if (checkGameOver(nextSquares)) {
      setWinner(calcWinner());
      setPaused(true);
      setGameOver(true);
      // TODO: Stop game
    }

    nextPlayer();
  }

  function handleStart() {
    setPaused(false);
  }

  function resetState() {
    setPaused(true);
    setGameOver(false);
    setCurrentPlayer(initCurrentPlayer);
    setSquares(initSquares);
    setWinner(initWinner);
    setScores(initScores);
    setTimeLeft(initTimeLeft);
  }

  function nextPlayer() {
    let nextPlayer = currentPlayer + 1;
    if (nextPlayer > NUM_PLAYERS) {
      nextPlayer = 1;
    }
    resetTimer();
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
    nextSquares[x][y] = currentPlayer;
    setSquares(nextSquares);
    setScores([calcScore(nextSquares, 1), calcScore(nextSquares, 2)]); // todo: only need to calc score for current player

    playPopSfx();

    if (checkGameOver(nextSquares)) {
      setWinner(calcWinner());
      setPaused(true);
      setGameOver(true);
      // TODO: Stop game
    }

    nextPlayer();
  }

  const boardElements = [];
  let avatar = { image: "", color: "" };

  // TODO: Use a nested map to generate grid
  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    const rowElements = [];
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      if (squares[x][y] === 1) {
        avatar = avatarData[avatars[0]];
      } else if (squares[x][y] === 2) {
        avatar = avatarData[avatars[1]];
      }
      rowElements.push(
        <Square
          player={squares[x][y]}
          avatar={avatar}
          onSquareClick={() => handleClick(x, y)}
          key={y * BOARD_WIDTH + x}
        />,
      );
    }

    boardElements.push(
      // <div className="board-row" key={y}>
      <>{rowElements}</>,
      // </div>
    );
  }

  const winStr = () => {
    if (winner === 0) {
      return "Tie!";
    }
    if (winner === 1) {
      return "Player 1 wins!";
    }
    if (winner === 2) {
      return "Player 2 wins!";
    }
  };

  return (
    <>
      {/* <ScoreBoard avatars={avatars} avatarData={avatarData} scores={scores} /> */}

      {/* <p>It's {currentPlayerAvatar()}'s turn.</p> */}
      <div className="status">
        <div className="score player1">
          {avatarData[avatars[0]].text}
          {scores[0]}
        </div>
        <div className="timer">
          {!checkGameOver(squares) && !paused && `⧖${timeLeft}`}
          {checkGameOver(squares) && winStr()}
        </div>
        {/* {checkGameOver(squares) && !paused && <State winner={winner} />} */}

        <div className="score player2">
          {scores[1]}
          {avatarData[avatars[1]].text}
        </div>
      </div>
      <div
        className="board"
        style={{
          gridTemplateColumns: gridConfigStr,
          aspectRatio: BOARD_WIDTH / BOARD_HEIGHT,
        }}
      >
        {boardElements}
      </div>
      <div className="status">
        {gameOver && (
          <button type="button" className="reset-button" onClick={resetState}>
            Reset
          </button>
        )}
      </div>
      {paused && !gameOver && (
        <Menu handleStart={handleStart}>
          <AvatarSelector
            avatars={avatars}
            avatarChoices={avatarData}
            setAvatars={setAvatars}
          />
        </Menu>
      )}
    </>
  );
}
