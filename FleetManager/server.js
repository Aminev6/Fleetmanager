const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const truckRoutes = require('./routes/truck');
app.use('/api/trucks', truckRoutes);
const missionRoutes = require('./routes/mission');
app.use('/api/missions', missionRoutes);
const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);
const expenseRoutes = require("./routes/expense");
app.use("/api/expenses", expenseRoutes);
const chauffeurRoutes = require('./routes/chauffeur');
app.use('/api/chauffeurs', chauffeurRoutes);
const typeDepenseRoutes = require('./routes/typeDepense');
app.use('/api/type-depenses', typeDepenseRoutes);
const reportRoutes = require('./routes/report');
app.use('/api/report', reportRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('FleetManager API en ligne');
});

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Serveur actif sur http://localhost:${PORT}`);
});
