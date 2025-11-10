require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const tugasAkhirRoutes = require('./routes/tugasAkhir');
const proposalRoutes = require('./routes/proposals');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' })); // Increase limit for file uploads (base64)

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'SIMTA API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tugas-akhir', tugasAkhirRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;