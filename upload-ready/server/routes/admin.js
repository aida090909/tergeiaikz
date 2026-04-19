const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/investigators — list all investigators
router.get('/investigators', (req, res) => {
    try {
        const db = getDb();
        const investigators = db.prepare(`
            SELECT u.id, u.iin, u.full_name, u.full_name_kz, u.rank, u.department, 
                   u.role, u.language_pref, u.created_at,
                   (SELECT COUNT(*) FROM cases WHERE investigator_id = u.id) as case_count,
                   (SELECT COUNT(*) FROM resolutions WHERE user_id = u.id) as resolution_count
            FROM users u
            WHERE u.role = 'investigator'
            ORDER BY u.created_at DESC
        `).all();

        res.json({ investigators });
    } catch (err) {
        console.error('Admin get investigators error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

// POST /api/admin/investigators — create a new investigator account
router.post('/investigators', (req, res) => {
    try {
        const { iin, password, full_name, full_name_kz, rank, department } = req.body;

        if (!iin || !password || !full_name) {
            return res.status(400).json({ error: 'ИИН, құпия сөз және толық аты-жөні міндетті / ИИН, пароль и ФИО обязательны' });
        }

        if (iin.length !== 12 || !/^\d{12}$/.test(iin)) {
            return res.status(400).json({ error: 'ИИН 12 саннан тұруы тиіс / ИИН должен состоять из 12 цифр' });
        }

        const db = getDb();
        const existing = db.prepare('SELECT id FROM users WHERE iin = ?').get(iin);
        if (existing) {
            return res.status(400).json({ error: 'Бұл ИИН-мен пайдаланушы бар / Пользователь с таким ИИН уже существует' });
        }

        const hash = bcrypt.hashSync(password, 10);

        const result = db.prepare(`
            INSERT INTO users (iin, password_hash, full_name, full_name_kz, rank, department, role)
            VALUES (?, ?, ?, ?, ?, ?, 'investigator')
        `).run(iin, hash, full_name, full_name_kz || '', rank || '', department || '');

        const newUser = db.prepare('SELECT id, iin, full_name, full_name_kz, rank, department, role, created_at FROM users WHERE id = ?')
            .get(result.lastInsertRowid);

        res.status(201).json({ investigator: newUser });
    } catch (err) {
        console.error('Admin create investigator error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

// GET /api/admin/investigators/:id — get investigator details
router.get('/investigators/:id', (req, res) => {
    try {
        const db = getDb();
        const investigator = db.prepare(`
            SELECT id, iin, full_name, full_name_kz, rank, department, role, language_pref, created_at
            FROM users WHERE id = ? AND role = 'investigator'
        `).get(req.params.id);

        if (!investigator) {
            return res.status(404).json({ error: 'Тергеуші табылмады / Следователь не найден' });
        }

        const cases = db.prepare(`
            SELECT c.*, (SELECT COUNT(*) FROM resolutions WHERE case_id = c.id) as resolution_count
            FROM cases c WHERE c.investigator_id = ?
            ORDER BY c.created_at DESC
        `).all(req.params.id);

        const resolutions = db.prepare(`
            SELECT r.*, c.case_number
            FROM resolutions r
            LEFT JOIN cases c ON r.case_id = c.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `).all(req.params.id);

        res.json({ investigator, cases, resolutions });
    } catch (err) {
        console.error('Admin get investigator error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

// PUT /api/admin/investigators/:id — update investigator
router.put('/investigators/:id', (req, res) => {
    try {
        const { password, full_name, full_name_kz, rank, department } = req.body;
        const db = getDb();

        const existing = db.prepare('SELECT id FROM users WHERE id = ? AND role = ?').get(req.params.id, 'investigator');
        if (!existing) {
            return res.status(404).json({ error: 'Тергеуші табылмады / Следователь не найден' });
        }

        if (password) {
            const hash = bcrypt.hashSync(password, 10);
            db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.params.id);
        }

        db.prepare(`
            UPDATE users SET
                full_name = COALESCE(?, full_name),
                full_name_kz = COALESCE(?, full_name_kz),
                rank = COALESCE(?, rank),
                department = COALESCE(?, department),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(full_name, full_name_kz, rank, department, req.params.id);

        const updated = db.prepare('SELECT id, iin, full_name, full_name_kz, rank, department, role, created_at FROM users WHERE id = ?')
            .get(req.params.id);

        res.json({ investigator: updated });
    } catch (err) {
        console.error('Admin update investigator error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

// DELETE /api/admin/investigators/:id
router.delete('/investigators/:id', (req, res) => {
    try {
        const db = getDb();
        const existing = db.prepare('SELECT id FROM users WHERE id = ? AND role = ?').get(req.params.id, 'investigator');
        if (!existing) {
            return res.status(404).json({ error: 'Тергеуші табылмады / Следователь не найден' });
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
        res.json({ message: 'Тергеуші жойылды / Следователь удалён' });
    } catch (err) {
        console.error('Admin delete investigator error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

// GET /api/admin/stats — dashboard statistics
router.get('/stats', (req, res) => {
    try {
        const db = getDb();
        const stats = {
            totalInvestigators: db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('investigator').count,
            totalCases: db.prepare('SELECT COUNT(*) as count FROM cases').get().count,
            totalResolutions: db.prepare('SELECT COUNT(*) as count FROM resolutions').get().count,
            activeCases: db.prepare("SELECT COUNT(*) as count FROM cases WHERE status = 'active'").get().count,
            recentResolutions: db.prepare(`
                SELECT r.*, c.case_number, u.full_name as investigator_name
                FROM resolutions r
                LEFT JOIN cases c ON r.case_id = c.id
                LEFT JOIN users u ON r.user_id = u.id
                ORDER BY r.created_at DESC LIMIT 10
            `).all()
        };
        res.json({ stats });
    } catch (err) {
        console.error('Admin stats error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

module.exports = router;
