const express = require('express');
const { getDb } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/cases - get all cases for current investigator
router.get('/', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        let cases;
        if (req.user.role === 'admin') {
            cases = db.prepare(`
                SELECT c.*, u.full_name as investigator_name, u.full_name_kz as investigator_name_kz,
                    (SELECT COUNT(*) FROM resolutions WHERE case_id = c.id) as resolution_count
                FROM cases c 
                LEFT JOIN users u ON c.investigator_id = u.id
                ORDER BY c.created_at DESC
            `).all();
        } else {
            cases = db.prepare(`
                SELECT c.*,
                    (SELECT COUNT(*) FROM resolutions WHERE case_id = c.id) as resolution_count
                FROM cases c 
                WHERE c.investigator_id = ? 
                ORDER BY c.created_at DESC
            `).all(req.user.id);
        }
        res.json({ cases });
    } catch (err) {
        console.error('Get cases error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

// GET /api/cases/:id
router.get('/:id', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const caseItem = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id);

        if (!caseItem) {
            return res.status(404).json({ error: 'Іс табылмады / Дело не найдено' });
        }

        if (req.user.role !== 'admin' && caseItem.investigator_id !== req.user.id) {
            return res.status(403).json({ error: 'Рұқсат жоқ / Доступ запрещён' });
        }

        const resolutions = db.prepare(`
            SELECT * FROM resolutions WHERE case_id = ? ORDER BY created_at DESC
        `).all(req.params.id);

        res.json({ case: caseItem, resolutions });
    } catch (err) {
        console.error('Get case error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

// POST /api/cases
router.post('/', authMiddleware, (req, res) => {
    try {
        const {
            case_number, article, description_ru, description_kz,
            suspect_name, suspect_iin, victim_name, city,
            incident_date, incident_place
        } = req.body;

        if (!case_number || !article) {
            return res.status(400).json({ error: 'Іс нөмірі мен бапты енгізіңіз / Введите номер дела и статью' });
        }

        const db = getDb();

        const existing = db.prepare('SELECT id FROM cases WHERE case_number = ?').get(case_number);
        if (existing) {
            return res.status(400).json({ error: 'Бұл нөмірмен іс бар / Дело с таким номером уже существует' });
        }

        const result = db.prepare(`
            INSERT INTO cases (case_number, investigator_id, article, description_ru, description_kz,
                suspect_name, suspect_iin, victim_name, city, incident_date, incident_place)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            case_number, req.user.id, article,
            description_ru || '', description_kz || '',
            suspect_name || '', suspect_iin || '',
            victim_name || '', city || '',
            incident_date || '', incident_place || ''
        );

        const newCase = db.prepare('SELECT * FROM cases WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ case: newCase });
    } catch (err) {
        console.error('Create case error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

// PUT /api/cases/:id
router.put('/:id', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const caseItem = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id);

        if (!caseItem) {
            return res.status(404).json({ error: 'Іс табылмады / Дело не найдено' });
        }

        if (req.user.role !== 'admin' && caseItem.investigator_id !== req.user.id) {
            return res.status(403).json({ error: 'Рұқсат жоқ / Доступ запрещён' });
        }

        const {
            article, description_ru, description_kz,
            suspect_name, suspect_iin, victim_name, city,
            incident_date, incident_place, status
        } = req.body;

        db.prepare(`
            UPDATE cases SET
                article = COALESCE(?, article),
                description_ru = COALESCE(?, description_ru),
                description_kz = COALESCE(?, description_kz),
                suspect_name = COALESCE(?, suspect_name),
                suspect_iin = COALESCE(?, suspect_iin),
                victim_name = COALESCE(?, victim_name),
                city = COALESCE(?, city),
                incident_date = COALESCE(?, incident_date),
                incident_place = COALESCE(?, incident_place),
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            article, description_ru, description_kz,
            suspect_name, suspect_iin, victim_name, city,
            incident_date, incident_place, status, req.params.id
        );

        const updated = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id);
        res.json({ case: updated });
    } catch (err) {
        console.error('Update case error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

// DELETE /api/cases/:id
router.delete('/:id', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const caseItem = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id);

        if (!caseItem) {
            return res.status(404).json({ error: 'Іс табылмады / Дело не найдено' });
        }

        if (req.user.role !== 'admin' && caseItem.investigator_id !== req.user.id) {
            return res.status(403).json({ error: 'Рұқсат жоқ / Доступ запрещён' });
        }

        db.prepare('DELETE FROM cases WHERE id = ?').run(req.params.id);
        res.json({ message: 'Іс жойылды / Дело удалено' });
    } catch (err) {
        console.error('Delete case error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

module.exports = router;
