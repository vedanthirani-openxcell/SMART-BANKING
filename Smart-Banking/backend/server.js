const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require("./routes/userRoutes");
const accountRoutes = require("./routes/accountRoutes");
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Banking backend is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/accounts',accountRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
.then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
.catch(err => console.log(err));
