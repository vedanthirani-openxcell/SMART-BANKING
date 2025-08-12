const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');
const userRoutes = require("../routes/userRoutes");
const adminRoutes = require("../routes/AdminRoutes");
const transactionRoutes = require("../routes/transactionRoutes");

const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('Banking backend is running...');
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/transactions', transactionRoutes);

  return app;
};

module.exports = createApp;
