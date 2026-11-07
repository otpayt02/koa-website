-- KOA website — public form tables (D1 / SQLite).
--
-- Migration 0001: contact submissions, donation intakes, and community
-- language-training contributions.
--
-- These tables are intentionally separate from the Drizzle-managed content
-- schema in db/schema.ts (drizzle/ migrations). Wrangler applies the files
-- in this folder for both the site worker and the forms worker, which share
-- the same D1 database (binding `DB`).
--
-- Privacy note: donation rows are INTAKES ONLY (a visitor saying "I want to
-- give"). No card numbers, bank details, or payment credentials are ever
-- stored here — payment processing stays with an external processor.

CREATE TABLE IF NOT EXISTS contact_submissions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  subject     TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new'
              CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_contact_created
  ON contact_submissions (created_at);

CREATE TABLE IF NOT EXISTS donation_intakes (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  -- Intended gift, stored as integer cents to avoid float rounding.
  amount_cents  INTEGER,
  frequency     TEXT NOT NULL DEFAULT 'one_time'
                CHECK (frequency IN ('one_time', 'monthly')),
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'completed', 'archived')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_donation_created
  ON donation_intakes (created_at);

-- Community-contributed S'gaw Karen language-training material.
-- Every row lands as 'unreviewed' and stays unreviewed until a human
-- reviewer approves it; unreviewed rows must never be exported into a
-- training dataset or displayed as approved translations.
-- karen_text holds ONLY text the contributor themselves supplied — the
-- site never generates or invents S'gaw Karen text.
CREATE TABLE IF NOT EXISTS training_contributions (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  contributor_name  TEXT,
  contributor_email TEXT,
  contribution_type TEXT NOT NULL DEFAULT 'recording_with_transcript'
                    CHECK (contribution_type IN (
                      'audio_recording',
                      'transcript',
                      'translation',
                      'recording_with_transcript'
                    )),
  language          TEXT NOT NULL DEFAULT 'ksw',  -- S'gaw Karen
  english_text      TEXT,
  karen_text        TEXT,
  transcript_text   TEXT,
  -- Link to the audio file as stored by the uploader (e.g. Drive/R2 URL).
  -- Audio binaries are not stored in D1.
  audio_url         TEXT,
  notes             TEXT,
  status            TEXT NOT NULL DEFAULT 'unreviewed'
                    CHECK (status IN ('unreviewed', 'approved', 'rejected')),
  reviewed_by       TEXT,
  reviewed_at       TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_training_status
  ON training_contributions (status, created_at);
