const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { metricsMiddleware, setupMetrics } = require('./metrics');
require('dotenv').config();

const app = express();

setupMetrics(app, { 
  serviceName: 'backend', 
  serviceVersion: '1.0.0' 
});

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);


connectDB();

app.use('/api/scores', require('./routes/scores'));
//app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
