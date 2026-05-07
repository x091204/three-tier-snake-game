const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const client = require('prom-client');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const register = new client.Registry();
client.collectDefaultMetrics({ register });

connectDB();

app.use('/auth', require('./routes/auth'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));