CREATE TABLE IF NOT EXISTS operators (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    operator_id  INTEGER REFERENCES operators(id),
    machine_line TEXT NOT NULL DEFAULT 'Line A',
    started_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at     DATETIME,
    total_cycles INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS press_events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER REFERENCES sessions(id),
    pressed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ppe_violations (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id    INTEGER REFERENCES sessions(id),
    violation_type TEXT NOT NULL,   -- 'no_helmet', 'no_vest', 'no_gloves'
    detected_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    snapshot_path TEXT,             -- path to saved frame image
    resolved      INTEGER DEFAULT 0 -- 0 = active, 1 = resolved
);