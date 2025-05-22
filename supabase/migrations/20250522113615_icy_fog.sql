/*
  # Create channel members table

  1. New Tables
    - `channel_members`
      - `id` (uuid, primary key)
      - `channel_id` (uuid, references channels.id)
      - `user_id` (uuid, references profiles.id)
      - `role` (text)
      - `joined_at` (timestamptz)
  2. Security
    - Enable RLS on `channel_members` table
    - Add policy for users to read channel members
    - Add policy for users to join public channels
    - Add policy for channel admins to add members to private channels
*/

CREATE TABLE IF NOT EXISTS channel_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read channel members
CREATE POLICY "Users can read channel members"
  ON channel_members
  FOR SELECT
  USING (true);

-- Policy to allow users to join public channels
CREATE POLICY "Users can join public channels"
  ON channel_members
  FOR INSERT
  WITH CHECK (
    (SELECT is_private FROM channels WHERE id = channel_id) = false
    AND user_id = auth.uid()
    AND role = 'member'
  );

-- Add policy for channel admins to add members to private channels
CREATE POLICY "Channel admins can add members"
  ON channel_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_id = NEW.channel_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Policy to allow users to read private channels they're members of
CREATE POLICY "Users can read private channels they're members of"
  ON channels
  FOR SELECT
  USING (
    is_private = false
    OR (
      is_private = true
      AND EXISTS (
        SELECT 1 FROM channel_members
        WHERE channel_id = id
        AND user_id = auth.uid()
      )
    )
  );

-- Add all users to the general channel
DO $$
DECLARE
  general_channel_id uuid;
  profile_id uuid;
BEGIN
  SELECT id INTO general_channel_id FROM channels WHERE name = 'general' LIMIT 1;
  
  IF general_channel_id IS NOT NULL THEN
    FOR profile_id IN SELECT id FROM profiles LOOP
      IF NOT EXISTS (
        SELECT 1 FROM channel_members
        WHERE channel_id = general_channel_id AND user_id = profile_id
      ) THEN
        INSERT INTO channel_members (channel_id, user_id, role)
        VALUES (general_channel_id, profile_id, 'member');
      END IF;
    END LOOP;
  END IF;
END
$$;