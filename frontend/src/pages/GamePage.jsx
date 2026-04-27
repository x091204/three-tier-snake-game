import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GameBoard  from '../components/GameBoard';
import Scoreboard from '../components/Scoreboard';
import s from './GamePage.module.css';

export default function GamePage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [refresh, setRefresh] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={s.page}>
      <header className={s.header}>
        <span className={`${s.logo} pixel`}>SNAKEGAME</span>
        <div className={s.nav}>
          <span className={s.username}>{user?.username}</span>
          <button className={s.navBtn} onClick={() => navigate('/about')}>About</button>
          <button className={s.navBtn} onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <main className={s.main}>
        <aside className={s.sidebar}>
          <Scoreboard refreshTrigger={refresh} />
        </aside>
        <section className={s.gameArea}>
          <GameBoard onScoreSaved={() => setRefresh(r => r + 1)} />
        </section>
      </main>
    </div>
  );
}