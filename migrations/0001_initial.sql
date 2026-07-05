PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher'
    CHECK (role IN ('teacher', 'school_admin', 'platform_admin')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS school_memberships (
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'teacher'
    CHECK (role IN ('teacher', 'admin')),
  PRIMARY KEY (school_id, user_id)
);

CREATE TABLE IF NOT EXISTS publishers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id),
  publisher_id TEXT REFERENCES publishers(id),
  school_id TEXT REFERENCES schools(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  source_url TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  source_platform TEXT NOT NULL DEFAULT 'unknown',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'processing', 'ready_for_review', 'published', 'failed', 'archived')),
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'school', 'public')),
  description_short TEXT NOT NULL DEFAULT '',
  student_goal TEXT NOT NULL DEFAULT '',
  how_to_play TEXT NOT NULL DEFAULT '[]',
  teacher_notes TEXT NOT NULL DEFAULT '[]',
  subject TEXT NOT NULL DEFAULT '',
  grade_min INTEGER NOT NULL DEFAULT 0,
  grade_max INTEGER NOT NULL DEFAULT 12,
  categories TEXT NOT NULL DEFAULT '[]',
  skills TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  activity_types TEXT NOT NULL DEFAULT '[]',
  play_mode TEXT NOT NULL DEFAULT 'new_tab'
    CHECK (play_mode IN ('new_tab', 'iframe', 'hosted')),
  embed_allowed INTEGER NOT NULL DEFAULT 0,
  hosted_object_key TEXT,
  moderation_state TEXT NOT NULL DEFAULT 'unreviewed'
    CHECK (moderation_state IN ('unreviewed', 'approved', 'flagged', 'rejected')),
  play_count INTEGER NOT NULL DEFAULT 0,
  save_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT,
  last_scanned_at TEXT
);

CREATE INDEX IF NOT EXISTS games_status_visibility
  ON games(status, visibility);
CREATE INDEX IF NOT EXISTS games_owner
  ON games(owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS games_publisher
  ON games(publisher_id, published_at DESC);

CREATE TABLE IF NOT EXISTS game_assets (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('screenshot', 'thumbnail', 'html', 'archive')),
  object_key TEXT NOT NULL,
  public_url TEXT,
  width INTEGER,
  height INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scan_jobs (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  progress INTEGER NOT NULL DEFAULT 0,
  current_step TEXT NOT NULL DEFAULT 'Queued',
  error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  started_at TEXT,
  finished_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id),
  school_id TEXT REFERENCES schools(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'school', 'public')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collection_games (
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, game_id)
);

CREATE TABLE IF NOT EXISTS moderation_reports (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  reporter_id TEXT REFERENCES users(id),
  reason TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO users (id, email, display_name, role)
VALUES ('teacher-joseph', 'teacher@example.com', 'Teacher Joseph', 'teacher');

INSERT OR IGNORE INTO publishers (id, name, slug, description, verified)
VALUES (
  'publisher-wellesley',
  'Wellesley Games',
  'wellesley-games',
  'Original classroom games created for lively, screen-ready lessons.',
  1
);
