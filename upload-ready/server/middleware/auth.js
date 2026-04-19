const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tergeu-ai-secret-key-2024-kz';

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Авторизация қажет / Требуется авторизация' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Жарамсыз токен / Недействительный токен' });
    }
}

function adminMiddleware(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Тек әкімші үшін / Только для администратора' });
    }
    next();
}

module.exports = { authMiddleware, adminMiddleware, JWT_SECRET };
