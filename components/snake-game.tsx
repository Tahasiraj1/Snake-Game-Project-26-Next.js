"use client"; // Enables client-side rendering for this component

import { useState, useEffect, useCallback, useRef } from "react"; // Import React hooks
import { Button } from "@/components/ui/button"; // Import custom Button component
import { PauseIcon, PlayIcon, RefreshCcwIcon } from "lucide-react"; // Import icons from lucide-react

enum GameState {
  START,
  PAUSE,
  RUNNING,
  GAME_OVER,
};

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

interface Position {
  x: number;
  y: number;
};

const initialSnake: Position[] = [{ x: 0, y: 0 }];
const initialFood: Position = { x: 5, y: 5 };

export default function SnakeGame() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [snake, setSnake] = useState<Position[]>(initialSnake);
  const [food, setFood] = useState<Position>(initialFood);
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const gameInterval = useRef<NodeJS.Timeout | null>(null);

  // Function to move snake.
  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const newSnake = [...prevSnake];
      const head = newSnake[0];
      let newHead: Position;

      switch (direction) {
        case Direction.UP:
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case Direction.DOWN:
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case Direction.LEFT:
          newHead = { x: head.x - 1, y:  head.y };
          break;
        case Direction.RIGHT:
          newHead = { x: head.x + 1, y: head.y };
          break;
        default:
          return newSnake;
      }

      newSnake.unshift(newHead);
      if (newHead.x === food.x && newHead.y === food.y) {
        setFood({
          x: Math.floor(Math.random() * 10),
          y: Math.floor(Math.random() * 10),
        });
        setScore((prevScore) => prevScore + 1);
      } else {
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [direction, food]);


  // Handle Key press events.
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    switch(e.key) {
      case "ArrowUp": 
        if (direction !== Direction.DOWN) setDirection(Direction.UP);
        break;
      case "ArrowDown":
        if (direction !== Direction.UP) setDirection(Direction.DOWN);
        break;
      case "ArrowLeft":
        if (direction !== Direction.RIGHT) setDirection(Direction.LEFT);
        break;
      case "ArrowRight":
        if (direction !== Direction.LEFT) setDirection(Direction.RIGHT);
        break;
    }
  }, [direction]);
  
  
  // UseEffect to handle game interval & key press events.
  useEffect(() => {
    if (gameState === GameState.RUNNING) {
      if (gameInterval.current) {
        clearInterval(gameInterval.current);
      }

      let speed = 200;
      if (score >= 25) {
        speed = 170;
      } else if (score >= 50) {
        speed = 130;
      }

      gameInterval.current = setInterval(moveSnake, speed);
      document.addEventListener("keydown", handleKeyPress);
    } else {
      if (gameInterval.current) clearInterval(gameInterval.current);
        document.removeEventListener("keydown", handleKeyPress);
    }

    return () => {
      if (gameInterval.current) clearInterval(gameInterval.current);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [gameState, moveSnake, handleKeyPress, score]);

  // Start game.
  const startGame = () => {
    setSnake(initialSnake);
    setFood(initialFood);
    setScore(0);
    setDirection(Direction.RIGHT);
    setGameState(GameState.RUNNING);
  };

  // Pause game.
  const pauseGame = () => {
    setGameState(
      gameState === GameState.RUNNING ? GameState.PAUSE : GameState.RUNNING
    );
  };

  // Reset game.
  const resetGame = () => {
    setGameState(GameState.START);
    setSnake(initialSnake);
    setFood(initialFood);
    setScore(0);
  };

  // useEffect to set highScore.
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0F0F0F] to-[#1E1E1E]">
      <div className="bg-[#1E1E1E] rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="text-3xl font-bold text-[#FF00FF]">Snake Game</div>
          <div className="flex gap-2">
            <Button
            // variant="ghost"
            size="icon"
            className="rounded-2xl text-[#00FFFF] hover:text-white"
            onClick={startGame}
            >
              <PlayIcon className="w-6 h-6" />
              <span className="sr-only">Start</span>
            </Button>
            <Button
            // variant="ghost"
            size="icon"
            className="rounded-2xl text-[#00FFFF] hover:text-white"
            onClick={pauseGame}
            >
              <PauseIcon className="w-6 h-6" />
              <span className="sr-only">Pause/Resume</span>
            </Button>
            <Button
            // variant="ghost"
            size="icon"
            className="rounded-2xl text-[#00FFFF] hover:text-white active:!-rotate-180 transition-transform duration-300"
            onClick={resetGame}
            >
              <RefreshCcwIcon className="w-6 h-6 active:-rotate-180 transition-transform duration-300" />
              <span className="sr-only">Reset</span>
            </Button>
          </div>
        </div>
        <div className="bg-[#0F0F0F] rounded-lg p-4 grid grid-cols-10 gap-1">
          {Array.from({ length: 100 }).map((_, i) => {
            const x = i % 10;
            const y = Math.floor(i / 10);
            const isSnakePart = snake.some((part) => part.x === x && part.y === y);
            const isFood = food.x === x && food.y === y;

            const snakeColor = 
              score >= 50
              ? "bg-[#e83326]"
              : score >= 25
              ? "bg-[#26e857]"
              : "bg-[#FF00FF]";

            const foodColor = 
              score >= 50
              ? "bg-[#e8a126]"
              : score >= 25
              ? "bg-[#d2e826]"
              : "bg-[#00FFFF]"
    
            return (
              <div
              key={i}
              className={`w-5 h-5 rounded-full ${
                isSnakePart
                ? snakeColor
                : isFood
                ? foodColor
                : "bg-[#1E1E1E]"
                }`}
                />
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-6 text-[#00FFFF] font-semibold">
          <div>Score: {score}</div>
          <div>High Score: {highScore}</div>
        </div>
      </div>
    </div>
  );
}