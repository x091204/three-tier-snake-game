import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const saveScore    = (score) => axios.post(`${BASE}/scores`, { score });
export const getTopScores = ()      => axios.get(`${BASE}/scores`);
