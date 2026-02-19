-- Fix: allow master owners to read their own availability regardless of status
DROP POLICY "Availability is viewable for approved masters" ON master_availability;

CREATE POLICY "Availability is viewable" ON master_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_availability.master_id
      AND (masters.status = 'approved' OR masters.user_id = auth.uid())
    )
  );
