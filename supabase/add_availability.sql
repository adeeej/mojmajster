-- Add availability calendar support

-- Add opt-in flag to masters table
ALTER TABLE masters ADD COLUMN show_availability BOOLEAN NOT NULL DEFAULT FALSE;

-- Availability table (stores busy dates per master)
CREATE TABLE master_availability (
  id SERIAL PRIMARY KEY,
  master_id INT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(master_id, date)
);

CREATE INDEX idx_availability_master ON master_availability(master_id);
CREATE INDEX idx_availability_date ON master_availability(date);

-- RLS
ALTER TABLE master_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Availability is viewable for approved masters" ON master_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_availability.master_id
      AND masters.status = 'approved'
    )
  );

CREATE POLICY "Masters can insert their own availability" ON master_availability
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_availability.master_id
      AND masters.user_id = auth.uid()
    )
  );

CREATE POLICY "Masters can delete their own availability" ON master_availability
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_availability.master_id
      AND masters.user_id = auth.uid()
    )
  );
