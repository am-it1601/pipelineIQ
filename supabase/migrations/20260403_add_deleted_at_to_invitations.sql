-- Add deleted_at column to invitations table for soft delete support
ALTER TABLE invitations
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- Create index for soft delete queries
CREATE INDEX idx_invitations_deleted_at ON invitations(deleted_at);
