const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/db');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
    try {
        const { iin, password } = req.body;

        if (!iin || !password) {
            return res.status(400).json({ error: 'ИИН мен құпия сөзді енгізіңіз / Введите ИИН и пароль' });
        }

        if (iin.length !== 12 || !/^\d{12}$/.test(iin)) {
            return res.status(400).json({ error: 'ИИН 12 саннан тұруы тиіс / ИИН должен состоять из 12 цифр' });
        }

        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE iin = ?').get(iin);

        if (!user) {
            return res.status(401).json({ error: 'Пайдаланушы табылмады / Пользователь не найден' });
        }

        const isValidPassword = bcrypt.compareSync(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Қате құпия сөз / Неверный пароль' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                iin: user.iin,
                role: user.role,
                full_name: user.full_name,
                full_name_kz: user.full_name_kz
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                iin: user.iin,
                full_name: user.full_name,
                full_name_kz: user.full_name_kz,
                rank: user.rank,
                department: user.department,
                role: user.role,
                language_pref: user.language_pref
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const user = db.prepare('SELECT id, iin, full_name, full_name_kz, rank, department, role, language_pref FROM users WHERE id = ?').get(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Пайдаланушы табылмады / Пользователь не найден' });
        }
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

module.exports = router;
