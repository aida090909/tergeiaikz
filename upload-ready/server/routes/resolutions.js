const express = require('express');
const { getDb } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { generateResolutionContent, getResolutionTypes, getResolutionTypeName, getCategoryName } = require('../services/templateEngine');
const { generateDocx, generatePdf } = require('../services/documentGenerator');

const router = express.Router();

// GET /api/resolutions/types — get all resolution types
router.get('/types', authMiddleware, (req, res) => {
    const types = getResolutionTypes();
    res.json({ types });
});

// GET /api/resolutions — get all resolutions for current user
router.get('/', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        let resolutions;

        if (req.user.role === 'admin') {
            resolutions = db.prepare(`
                SELECT r.*, c.case_number, u.full_name as investigator_name
                FROM resolutions r
                LEFT JOIN cases c ON r.case_id = c.id
                LEFT JOIN users u ON r.user_id = u.id
                ORDER BY r.created_at DESC
            `).all();
        } else {
            resolutions = db.prepare(`
                SELECT r.*, c.case_number
                FROM resolutions r
                LEFT JOIN cases c ON r.case_id = c.id
                WHERE r.user_id = ?
                ORDER BY r.created_at DESC
            `).all(req.user.id);
        }

        res.json({ resolutions });
    } catch (err) {
        console.error('Get resolutions error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

// GET /api/resolutions/:id
router.get('/:id', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const resolution = db.prepare(`
            SELECT r.*, c.case_number, c.article
            FROM resolutions r
            LEFT JOIN cases c ON r.case_id = c.id
            WHERE r.id = ?
        `).get(req.params.id);

        if (!resolution) {
            return res.status(404).json({ error: 'Қаулы табылмады / Постановление не найдено' });
        }

        if (req.user.role !== 'admin' && resolution.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Рұқсат жоқ / Доступ запрещён' });
        }

        res.json({ resolution });
    } catch (err) {
        console.error('Get resolution error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

// POST /api/resolutions/generate
router.post('/generate', authMiddleware, (req, res) => {
    try {
        const { case_id, resolution_type, category, language, startTime, endTime } = req.body;

        if (!case_id || !resolution_type) {
            return res.status(400).json({ error: 'Іс пен қаулы түрін таңдаңыз / Выберите дело и тип постановления' });
        }

        const db = getDb();
        const caseData = db.prepare('SELECT * FROM cases WHERE id = ?').get(case_id);

        if (!caseData) {
            return res.status(404).json({ error: 'Іс табылмады / Дело не найдено' });
        }

        if (req.user.role !== 'admin' && caseData.investigator_id !== req.user.id) {
            return res.status(403).json({ error: 'Рұқсат жоқ / Доступ запрещён' });
        }

        const userData = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
        const lang = language || userData.language_pref || 'kz';

        const content = generateResolutionContent(resolution_type, caseData, userData, lang, { startTime, endTime });
        if (!content) {
            return res.status(400).json({ error: 'Белгісіз қаулы түрі / Неизвестный тип постановления' });
        }

        // Find category for the type
        let foundCategory = category || '';
        if (!foundCategory) {
            const types = getResolutionTypes();
            for (const [catKey, catVal] of Object.entries(types)) {
                if (catVal.types[resolution_type]) {
                    foundCategory = catKey;
                    break;
                }
            }
        }

        const result = db.prepare(`
            INSERT INTO resolutions (case_id, user_id, resolution_type, category, language, content, status)
            VALUES (?, ?, ?, ?, ?, ?, 'draft')
        `).run(case_id, req.user.id, resolution_type, foundCategory, lang, content);

        const resolution = db.prepare('SELECT * FROM resolutions WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({
            resolution,
            typeName: getResolutionTypeName(resolution_type, lang),
            categoryName: getCategoryName(foundCategory, lang)
        });
    } catch (err) {
        console.error('Generate resolution error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

// PUT /api/resolutions/:id
router.put('/:id', authMiddleware, (req, res) => {
    try {
        const { content, status } = req.body;
        const db = getDb();

        const resolution = db.prepare('SELECT * FROM resolutions WHERE id = ?').get(req.params.id);
        if (!resolution) {
            return res.status(404).json({ error: 'Қаулы табылмады / Постановление не найдено' });
        }

        if (req.user.role !== 'admin' && resolution.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Рұқсат жоқ / Доступ запрещён' });
        }

        db.prepare(`
            UPDATE resolutions SET
                content = COALESCE(?, content),
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(content, status, req.params.id);

        const updated = db.prepare('SELECT * FROM resolutions WHERE id = ?').get(req.params.id);
        res.json({ resolution: updated });
    } catch (err) {
        console.error('Update resolution error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

// DELETE /api/resolutions/:id
router.delete('/:id', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const resolution = db.prepare('SELECT * FROM resolutions WHERE id = ?').get(req.params.id);

        if (!resolution) {
            return res.status(404).json({ error: 'Қаулы табылмады / Постановление не найдено' });
        }

        if (req.user.role !== 'admin' && resolution.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Рұқсат жоқ / Доступ запрещён' });
        }

        db.prepare('DELETE FROM resolutions WHERE id = ?').run(req.params.id);
        res.json({ message: 'Қаулы жойылды / Постановление удалено' });
    } catch (err) {
        console.error('Delete resolution error:', err);
        res.status(500).json({ error: 'Сервер қатесі / Ошибка сервера' });
    }
});

// GET /api/resolutions/:id/download/docx
router.get('/:id/download/docx', authMiddleware, async (req, res) => {
    try {
        const db = getDb();
        const resolution = db.prepare(`
            SELECT r.*, c.case_number
            FROM resolutions r
            LEFT JOIN cases c ON r.case_id = c.id
            WHERE r.id = ?
        `).get(req.params.id);

        if (!resolution) {
            return res.status(404).json({ error: 'Қаулы табылмады / Постановление не найдено' });
        }

        if (req.user.role !== 'admin' && resolution.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Рұқсат жоқ / Доступ запрещён' });
        }

        const typeName = getResolutionTypeName(resolution.resolution_type, resolution.language);
        const fileName = `${typeName}_${resolution.case_number || 'doc'}.docx`.replace(/[\s\/\\]/g, '_');

        const buffer = await generateDocx(resolution.content, typeName);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
        res.send(buffer);
    } catch (err) {
        console.error('Download DOCX error:', err);
        res.status(500).json({ error: 'Құжат жасау қатесі / Ошибка создания документа' });
    }
});

// GET /api/resolutions/:id/download/pdf
router.get('/:id/download/pdf', authMiddleware, async (req, res) => {
    try {
        const db = getDb();
        const resolution = db.prepare(`
            SELECT r.*, c.case_number
            FROM resolutions r
            LEFT JOIN cases c ON r.case_id = c.id
            WHERE r.id = ?
        `).get(req.params.id);

        if (!resolution) {
            return res.status(404).json({ error: 'Қаулы табылмады / Постановление не найдено' });
        }

        if (req.user.role !== 'admin' && resolution.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Рұқсат жоқ / Доступ запрещён' });
        }

        const typeName = getResolutionTypeName(resolution.resolution_type, resolution.language);
        const fileName = `${typeName}_${resolution.case_number || 'doc'}.pdf`.replace(/[\s\/\\]/g, '_');

        const buffer = await generatePdf(resolution.content, typeName);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
        res.send(buffer);
    } catch (err) {
        console.error('Download PDF error:', err);
        res.status(500).json({ error: 'Құжат жасау қатесі / Ошибка создания документа' });
    }
});

module.exports = router;
