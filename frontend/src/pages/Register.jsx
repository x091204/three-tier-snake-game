import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';
import s from './Auth.module.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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

        <p className={s.sub}>Create an account</p>

        <form onSubmit={handleSubmit} className={s.form}>
          <input
            className={s.input}
            type="text"
            placeholder="Username (min 3 chars)"
            value={username}
            onChange={e => setUsername(e.target.value)}
            minLength={3}
            required
          />
          <input
            className={s.input}
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
            required
          />
          {error && <p className={s.error}>{error}</p>}
          <button className={s.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className={s.link}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}