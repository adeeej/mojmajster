-- Allow masters to delete their own profile
-- Run this in Supabase SQL editor
CREATE POLICY "Users can delete their own master profile"
  ON masters
  FOR DELETE
  USING (auth.uid() = user_id);
