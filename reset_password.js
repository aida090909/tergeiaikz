const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'server', 'database', 'tergeu.db'));
const hash = bcrypt.hashSync('admin123', 10);
db.prepare('UPDATE users SET password_hash = ? WHERE iin = ?').run(hash, '000000000000');
console.log('✅ Пароль сброшен!');
const user = db.prepare('SELECT iin, role FROM users WHERE iin = ?').get('000000000000');
console.log('Пользователь:', user);
