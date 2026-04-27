import { useEffect, useState } from 'react';
import { getTopScores } from '../api';
import s from './Scoreboard.module.css';

export default function Scoreboard({ refreshTrigger }) {
  const [scores,  setScores]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getTopScores();
        setScores(res.data);
      } catch {
        setError('Could not load scores.');
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, [refreshTrigger]);

  return (
    <div className={s.board}>
      <div className={s.titleWrap}>
        <p className={`${s.pixelTitle} pixel`}>SCORE</p>
      </div>

      <p className={s.label}>Leaderboard</p>

      {loading && <p className={s.msg}>Loading...</p>}
      {error   && <p className={s.error}>{error}</p>}

      {!loading && !error && (
        <table className={s.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, i) => (
              <tr key={score._id}>
                <td>{i + 1}</td>
                <td>{score.username || '—'}</td>
                <td>{score.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}