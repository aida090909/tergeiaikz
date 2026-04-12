const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./config/db');

const authRoutes = require('./routes/auth');
const casesRoutes = require('./routes/cases');
const resolutionsRoutes = require('./routes/resolutions');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize database
initDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/resolutions', resolutionsRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files in production
const clientBuild = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuild));
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(clientBuild, 'index.html'));
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Ішкі сервер қатесі / Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║         TERGEU AI Server               ║
║     http://localhost:${PORT}              ║
║                                        ║
║  Админ: ИИН 000000000000              ║
║  Пароль: admin123                      ║
╚════════════════════════════════════════╝
    `);
});

module.exports = app;
