-- Contact messages table
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_read ON contact_messages(read_at);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
-- All reads and writes handled via service role (server-side only)
