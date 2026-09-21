-- ============================================================
-- FEPS Events System — Supabase Migration SQL
-- Run this once in your Supabase project → SQL Editor
-- ============================================================

-- 1. Event Categories
CREATE TABLE IF NOT EXISTS event_categories (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name_en    TEXT NOT NULL,
  name_ar    TEXT NOT NULL,
  name_fr    TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#1A3A6E',
  bg         TEXT NOT NULL DEFAULT 'rgba(26,58,110,0.12)'
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'EDITOR' CHECK (role IN ('EDITOR','MANAGER','SUPERADMIN')),
  permissions TEXT DEFAULT '["events:create"]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT now(),
  action      TEXT NOT NULL,
  user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT,
  entity_id   TEXT,
  details     TEXT
);

-- 4. Events
CREATE TABLE IF NOT EXISTS events (
  id                      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title                   TEXT NOT NULL,
  title_ar                TEXT,
  title_fr                TEXT,
  category_id             TEXT NOT NULL REFERENCES event_categories(id),
  start_date              TIMESTAMPTZ NOT NULL,
  end_date                TIMESTAMPTZ,
  location                TEXT,
  location_ar             TEXT,
  location_fr             TEXT,
  description             TEXT,
  description_ar          TEXT,
  description_fr          TEXT,
  agenda_text             TEXT,
  agenda_text_ar          TEXT,
  agenda_text_fr          TEXT,
  agenda_file             TEXT,
  image_url               TEXT,
  published               BOOLEAN NOT NULL DEFAULT false,
  status                  TEXT NOT NULL DEFAULT 'ACTIVE',
  report_summary          TEXT,
  report_results          TEXT,
  report_recommendations  TEXT,
  report_custom_fields    TEXT,
  survey_questions        TEXT,
  survey_enabled          BOOLEAN NOT NULL DEFAULT false,
  registration_enabled    BOOLEAN NOT NULL DEFAULT false,
  registration_open       BOOLEAN NOT NULL DEFAULT true,
  registration_mode       TEXT NOT NULL DEFAULT 'CREDIT_CODE',
  invitation_config       TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id        TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  identifier      TEXT NOT NULL,
  identifier_type TEXT NOT NULL DEFAULT 'CREDIT_CODE',
  name            TEXT,
  email           TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, identifier)
);

-- 6. Survey Responses
CREATE TABLE IF NOT EXISTS survey_responses (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id        TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  registration_id TEXT REFERENCES event_registrations(id) ON DELETE SET NULL,
  answers         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Trivia Categories
CREATE TABLE IF NOT EXISTS trivia_categories (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name_en    TEXT NOT NULL,
  name_ar    TEXT NOT NULL,
  name_fr    TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#1A3A6E',
  bg         TEXT NOT NULL DEFAULT 'rgba(26,58,110,0.12)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Trivia Questions
CREATE TABLE IF NOT EXISTS trivia_questions (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category_id    TEXT REFERENCES trivia_categories(id) ON DELETE CASCADE,
  text_en        TEXT NOT NULL,
  text_ar        TEXT NOT NULL,
  text_fr        TEXT NOT NULL,
  options        TEXT NOT NULL,
  explanation    TEXT,
  explanation_ar TEXT,
  explanation_fr TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Disable Row Level Security (we use service role key server-side)
-- ============================================================
ALTER TABLE event_categories      DISABLE ROW LEVEL SECURITY;
ALTER TABLE users                  DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs             DISABLE ROW LEVEL SECURITY;
ALTER TABLE events                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations    DISABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses       DISABLE ROW LEVEL SECURITY;
ALTER TABLE trivia_categories      DISABLE ROW LEVEL SECURITY;
ALTER TABLE trivia_questions       DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Useful indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_events_published ON events(published);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_event ON survey_responses(event_id);

-- ============================================================
-- Seed Data
-- ============================================================

-- Users (password is 'admin123' for all)
INSERT INTO users (id, name, email, password, role, permissions) VALUES
('usr_1', 'Super Admin', 'admin@feps.edu.eg', '$2b$10$8oBzjU8Ywye6UTKsfa0eOed/Nb.elgvILw5.LIEV4w42g6PD1SHZ2', 'SUPERADMIN', '["events:create","events:publish","events:delete","events:reports","events:invitation","users:manage","categories:manage","logs:view","trivia:manage"]'),
('usr_2', 'Events Manager', 'manager@feps.edu.eg', '$2b$10$8oBzjU8Ywye6UTKsfa0eOed/Nb.elgvILw5.LIEV4w42g6PD1SHZ2', 'MANAGER', '["events:create","events:publish","events:reports","events:invitation","trivia:manage"]'),
('usr_3', 'Content Editor', 'editor@feps.edu.eg', '$2b$10$8oBzjU8Ywye6UTKsfa0eOed/Nb.elgvILw5.LIEV4w42g6PD1SHZ2', 'EDITOR', '["events:create"]')
ON CONFLICT (email) DO NOTHING;

-- Default Event Categories
INSERT INTO event_categories (id, name_en, name_ar, name_fr, color, bg) VALUES
('cat_1', 'Conference', 'مؤتمر', 'Conférence', '#1A3A6E', 'rgba(26,58,110,0.12)'),
('cat_2', 'Seminar', 'ندوة', 'Séminaire', '#D4AF37', 'rgba(212,175,55,0.12)'),
('cat_3', 'Workshop', 'ورشة عمل', 'Atelier', '#2C3E50', 'rgba(44,62,80,0.12)')
ON CONFLICT (id) DO NOTHING;

-- Trivia Categories
INSERT INTO trivia_categories (id, name_en, name_ar, name_fr, color, bg) VALUES
('tc_1', 'FEPS History', 'تاريخ الكلية', 'Histoire de la FEPS', '#1A3A6E', '#f0f4f8'),
('tc_2', 'Notable Alumni', 'خريجون بارزون', 'Anciens élèves notables', '#D4AF37', '#fffcf0'),
('tc_3', 'Academic Departments', 'الأقسام الأكاديمية', 'Départements Académiques', '#2C3E50', '#f0f2f5')
ON CONFLICT (id) DO NOTHING;

-- Trivia Questions
INSERT INTO trivia_questions (id, category_id, text_en, text_ar, text_fr, options, explanation, explanation_ar, explanation_fr) VALUES
('tq_1', 'tc_1', 'In what year was the Faculty of Economics and Political Science established?', 'في أي عام تم تأسيس كلية الاقتصاد والعلوم السياسية؟', 'En quelle année la Faculté d''Économie et de Sciences Politiques a-t-elle été créée ?', '[{"id":"1","textEn":"1958","textAr":"1958","textFr":"1958","isCorrect":false},{"id":"2","textEn":"1960","textAr":"1960","textFr":"1960","isCorrect":true},{"id":"3","textEn":"1970","textAr":"1970","textFr":"1970","isCorrect":false}]', 'The faculty was established in 1960 as a premier institution in Egypt and the region.', 'تأسست الكلية عام 1960 كأول مؤسسة رائدة في مصر والمنطقة.', 'La faculté a été créée en 1960 en tant que première institution en Égypte et dans la région.'),

('tq_2', 'tc_2', 'Which of the following notable figures graduated from FEPS?', 'من من الشخصيات البارزة التالية تخرج من كلية الاقتصاد والعلوم السياسية؟', 'Laquelle des personnalités suivantes a obtenu son diplôme de la FEPS ?', '[{"id":"1","textEn":"Ahmed Zewail","textAr":"أحمد زويل","textFr":"Ahmed Zewail","isCorrect":false},{"id":"2","textEn":"Boutros Boutros-Ghali","textAr":"بطرس بطرس غالي","textFr":"Boutros Boutros-Ghali","isCorrect":false},{"id":"3","textEn":"Mahmoud Mohieldin","textAr":"محمود محيي الدين","textFr":"Mahmoud Mohieldin","isCorrect":true}]', 'Mahmoud Mohieldin is a prominent economist and a proud alumnus of the faculty.', 'محمود محيي الدين هو اقتصادي بارز وخريج فخور للكلية.', 'Mahmoud Mohieldin est un économiste de premier plan et un ancien élève de la faculté.'),

('tq_3', 'tc_3', 'How many main academic departments exist in FEPS currently?', 'كم عدد الأقسام الأكاديمية الرئيسية في الكلية حالياً؟', 'Combien de départements académiques principaux y a-t-il actuellement à la FEPS ?', '[{"id":"1","textEn":"3","textAr":"3","textFr":"3","isCorrect":false},{"id":"2","textEn":"5","textAr":"5","textFr":"5","isCorrect":true},{"id":"3","textEn":"7","textAr":"7","textFr":"7","isCorrect":false}]', 'FEPS has 5 main departments: Economics, Political Science, Statistics, Public Administration, and Social Science Computing.', 'تضم الكلية 5 أقسام رئيسية: الاقتصاد، العلوم السياسية، الإحصاء، الإدارة العامة، والحاسب الآلي في العلوم الاجتماعية.', 'La FEPS compte 5 départements principaux: Économie, Sciences Politiques, Statistiques, Administration Publique et Informatique Sociale.')
ON CONFLICT (id) DO NOTHING;

