const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');
const userRoutes = require("../routes/userRoutes");
const adminRoutes = require("../routes/AdminRoutes");


const createApp = () => {
  const app = express();

  app.use(cors({
  origin: 'http://localhost:5173', // Your React frontend URL
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'],
  credentials: true
}));
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('Banking backend is running...');
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);

  return app;
};

module.exports = createApp;
