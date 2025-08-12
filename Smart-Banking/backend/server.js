require('dotenv').config();
const connectDB = require('./config/db');
const createServer = require('./config/app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  const app = createServer();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
