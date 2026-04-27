import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import s from './Auth.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login: authLogin }    = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(username, password);
      authLogin({ token: res.data.token, username: res.data.username });
      navigate('/game');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.box}>
        <div className={s.logoWrap}>
          <h1 className={`${s.logo} pixel`}>SNAKE</h1>
          <h1 className={`${s.logo} pixel`}>GAME</h1>
        </div>

        <p className={s.sub}>Sign in to play</p>

        <form onSubmit={handleSubmit} className={s.form}>
          <input
            className={s.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            className={s.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className={s.error}>{error}</p>}
          <button className={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className={s.link}>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}