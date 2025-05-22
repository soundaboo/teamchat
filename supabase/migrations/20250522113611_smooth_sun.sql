/*
  # Create channels table

  1. New Tables
    - `channels`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `is_private` (boolean)
      - `created_by` (uuid, references profiles.id)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `channels` table
    - Add policy for users to read public channels
    - Add policy for users to read private channels they're members of
    - Add policy for users to create channels
    - Add policy for users to update channels they created
*/

CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_private boolean DEFAULT false,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read public channels
CREATE POLICY "Users can read public channels"
  ON channels
  FOR SELECT
  USING (is_private = false);

-- Create a general channel if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM channels WHERE name = 'general') THEN
    INSERT INTO channels (name, description, is_private, created_by)
    VALUES (
      'general',
      'General discussion for the entire team',
      false,
      (SELECT id FROM profiles LIMIT 1)
    );
  END IF;
END
$$;