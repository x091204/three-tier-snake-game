const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { metricsMiddleware, setupMetrics } = require('./metrics');
require('dotenv').config();

const app = express();

setupMetrics(app, { 
  serviceName: 'auth-service', 
  serviceVersion: '1.0.0' 
});

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);


connectDB();

app.use('/auth', require('./routes/auth'));
//app.get('/health', (req, res) => res.json({ status: 'ok' }));


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));