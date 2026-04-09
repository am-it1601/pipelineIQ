-- Enable RLS on upwork_profiles table
ALTER TABLE upwork_profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all upwork profiles
CREATE POLICY "Anyone can view upwork profiles" ON upwork_profiles
FOR SELECT
USING (true);

-- Allow authenticated admins to insert, update, delete
CREATE POLICY "Admins can manage upwork profiles" ON upwork_profiles
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update upwork profiles" ON upwork_profiles
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

CREATE POLICY "Admins can delete upwork profiles" ON upwork_profiles
FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
