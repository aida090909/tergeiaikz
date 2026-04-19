-- Tergeu AI Database Schema

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    iin TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    full_name_kz TEXT,
    rank TEXT DEFAULT '',
    department TEXT DEFAULT '',
    role TEXT DEFAULT 'investigator' CHECK(role IN ('admin', 'investigator')),
    language_pref TEXT DEFAULT 'kz' CHECK(language_pref IN ('kz', 'ru')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_number TEXT UNIQUE NOT NULL,
    investigator_id INTEGER NOT NULL,
    article TEXT NOT NULL,
    description_ru TEXT DEFAULT '',
    description_kz TEXT DEFAULT '',
    suspect_name TEXT DEFAULT '',
    suspect_iin TEXT DEFAULT '',
    victim_name TEXT DEFAULT '',
    city TEXT DEFAULT '',
    incident_date TEXT DEFAULT '',
    incident_place TEXT DEFAULT '',
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'closed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investigator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resolutions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    resolution_type TEXT NOT NULL,
    category TEXT NOT NULL,
    language TEXT DEFAULT 'kz' CHECK(language IN ('kz', 'ru')),
    content TEXT DEFAULT '',
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'final')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cases_investigator ON cases(investigator_id);
CREATE INDEX IF NOT EXISTS idx_resolutions_case ON resolutions(case_id);
CREATE INDEX IF NOT EXISTS idx_resolutions_user ON resolutions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_iin ON users(iin);
