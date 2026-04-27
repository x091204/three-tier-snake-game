import { useCallback } from 'react';
import { useAuth }   from '../context/AuthContext';
import useGame       from '../hooks/useGame';
import { saveScore } from '../api';
import s from './GameBoard.module.css';

const CELL = 24;

export default function GameBoard({ onScoreSaved }) {
  const { user } = useAuth();

  const handleGameOver = useCallback(async (finalScore) => {
    if (finalScore > 0 && user?.token) {
      try {
        await saveScore(finalScore, user.token);
        onScoreSaved();
      } catch (err) {
        console.error('Failed to save score:', err);
      }
    }
  }, [user, onScoreSaved]);

  const { snake, food, score, running, dead, startGame, COLS, ROWS } = useGame(handleGameOver);

  const width  = COLS * CELL;
  const height = ROWS * CELL;

  const isHead  = (x, y) => snake[0]?.x === x && snake[0]?.y === y;
  const isSnake = (x, y) => snake.some(s => s.x === x && s.y === y);
  const isFood  = (x, y) => food.x === x && food.y === y;

  return (
    <div className={s.wrapper}>
      <div className={s.scoreBar}>
        <span className={s.label}>SCORE</span>
        <span className={s.value}>{score}</span>
      </div>

      <div
        className={s.grid}
        style={{
          width:  `${width}px`,
          height: `${height}px`,
          gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
          gridTemplateRows:    `repeat(${ROWS}, ${CELL}px)`,
        }}
      >
        {Array.from({ length: ROWS }, (_, y) =>
          Array.from({ length: COLS }, (_, x) => {
            let cls = s.cell;
            if (isHead(x, y))        cls += ` ${s.head}`;
            else if (isSnake(x, y))  cls += ` ${s.snake}`;
            else if (isFood(x, y))   cls += ` ${s.food}`;
            return <div key={`${x}-${y}`} className={cls} />;
          })
        )}
      </div>

      <div className={s.controls}>
        {!running && (
          <button className={s.btn} onClick={startGame}>
            {dead ? 'PLAY AGAIN' : 'START GAME'}
          </button>
        )}
        {dead && <p className={s.dead}>Game Over — {score} pts</p>}
      </div>
    </div>
  );
}