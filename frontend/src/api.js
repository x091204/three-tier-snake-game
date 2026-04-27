import axios from 'axios';

const AUTH_BASE = import.meta.env.VITE_AUTH_URL || 'http://localhost:4000';
const API_BASE  = import.meta.env.VITE_API_URL  || 'http://localhost:5000/api';

export const register = (username, password) =>
  axios.post(`${AUTH_BASE}/auth/register`, { username, password });

export const login = (username, password) =>
  axios.post(`${AUTH_BASE}/auth/login`, { username, password });

export const saveScore = (score, token) =>
  axios.post(`${API_BASE}/scores`, { score }, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getTopScores = () =>
  axios.get(`${API_BASE}/scores`);