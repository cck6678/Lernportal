CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_members (
  id BIGSERIAL PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ranking_scores (
  member_id BIGINT PRIMARY KEY REFERENCES class_members(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  topics_done INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_class_members_class_id ON class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_ranking_scores_points ON ranking_scores(points DESC, topics_done DESC);

INSERT INTO classes (id, name, join_code)
VALUES ('klasse-demo-11a', 'Demo Klasse 11A', 'DEMO11')
ON CONFLICT (id) DO NOTHING;
