-- Single-row table holding the whole site content as JSON.
CREATE TABLE content (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  json TEXT NOT NULL
);

-- Contact-form submissions.
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  at TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0
);
