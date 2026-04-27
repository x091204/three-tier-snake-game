import { useState, useEffect, useCallback, useRef } from 'react';

const COLS = 20;
const ROWS = 20;
const CELL = 24;
const SPEED = 150;

const randomFood = () => ({
  x: Math.floor(Math.random() * COLS),
  y: Math.floor(Math.random() * ROWS),
});

export default function useGame(onGameOver) {
  const [snake,   setSnake]   = useState([{ x: 10, y: 10 }]);
  const [food,    setFood]    = useState(randomFood);
  const [dir,     setDir]     = useState({ x: 1, y: 0 });
  const [score,   setScore]   = useState(0);
  const [running, setRunning] = useState(false);
  const [dead,    setDead]    = useState(false);

  const dirRef   = useRef(dir);
  const scoreRef = useRef(score);

  useEffect(() => { dirRef.current = dir; },   [dir]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  // Keyboard controls
  useEffect(() => {
    const handle = (e) => {
      const moves = {
        ArrowUp:    { x: 0,  y: -1 },
        ArrowDown:  { x: 0,  y:  1 },
        ArrowLeft:  { x: -1, y:  0 },
        ArrowRight: { x: 1,  y:  0 },
      };
      if (moves[e.key]) {
        e.preventDefault();
        // Prevent reversing direction
        const cur = dirRef.current;
        const next = moves[e.key];
        if (cur.x + next.x === 0 && cur.y + next.y === 0) return;
        setDir(next);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  const tick = useCallback(() => {
    setSnake((prev) => {
      const d    = dirRef.current;
      const head = { x: prev[0].x + d.x, y: prev[0].y + d.y };

      // Wall hit
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        setRunning(false);
        setDead(true);
        onGameOver(scoreRef.current);
        return prev;
      }

      // Self hit
      if (prev.some((s) => s.x === head.x && s.y === head.y)) {
        setRunning(false);
        setDead(true);
        onGameOver(scoreRef.current);
        return prev;
      }

      const ateFood = head.x === food.x && head.y === food.y;
      const next    = [head, ...prev];
      if (!ateFood) {
        next.pop();
      } else {
        setFood(randomFood());
        setScore((s) => s + 10);
      }
      return next;
    });
  }, [food, onGameOver]);

  // Game loop
  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, SPEED);
    return () => clearInterval(id);
  }, [running, tick]);

  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(randomFood());
    setDir({ x: 1, y: 0 });
    setScore(0);
    setDead(false);
    setRunning(true);
  };

  return { snake, food, score, running, dead, startGame, COLS, ROWS, CELL };
}