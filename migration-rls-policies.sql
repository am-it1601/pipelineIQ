-- Enable RLS on lead_logs table
ALTER TABLE lead_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SELECT POLICIES
-- ============================================================

-- Policy 1: Admins can view all leads
CREATE POLICY "Admins can view all leads" ON lead_logs
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Policy 2: BD members can view only their assigned leads
CREATE POLICY "BD members can view assigned leads" ON lead_logs
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'bd'
  )
  AND assigned_to_id = auth.uid()
);

-- ============================================================
-- INSERT POLICIES
-- ============================================================

-- Policy 3: Admins can create leads and assign to anyone
CREATE POLICY "Admins can create leads" ON lead_logs
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Policy 4: BD members can create leads (auto-assigned to themselves)
CREATE POLICY "BD members can create leads" ON lead_logs
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'bd'
  )
  AND assigned_to_id = auth.uid()
);

-- ============================================================
-- UPDATE POLICIES
-- ============================================================

-- Policy 5: Admins can update all leads
CREATE POLICY "Admins can update all leads" ON lead_logs
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Policy 6: BD members can only update their assigned leads
CREATE POLICY "BD members can update assigned leads" ON lead_logs
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'bd'
  )
  AND assigned_to_id = auth.uid()
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'bd'
  )
  AND assigned_to_id = auth.uid()
);

-- ============================================================
-- DELETE POLICIES
-- ============================================================

-- Policy 7: Admins can delete all leads
CREATE POLICY "Admins can delete all leads" ON lead_logs
FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Policy 8: BD members cannot delete leads (optional - remove if they should be able to)
-- If you want BD members to delete, uncomment below:
-- CREATE POLICY "BD members can delete assigned leads" ON lead_logs
-- FOR DELETE
-- USING (
--   auth.uid() IN (
--     SELECT id FROM profiles WHERE role = 'bd'
--   )
--   AND assigned_to_id = auth.uid()
-- );
