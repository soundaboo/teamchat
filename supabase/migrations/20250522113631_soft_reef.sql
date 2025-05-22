/*
  # Create direct messages table

  1. New Tables
    - `direct_messages`
      - `id` (uuid, primary key)
      - `content` (text)
      - `sender_id` (uuid, references profiles.id)
      - `recipient_id` (uuid, references profiles.id)
      - `created_at` (timestamptz)
      - `is_read` (boolean)
  2. Security
    - Enable RLS on `direct_messages` table
    - Add policy for users to read direct messages they sent or received
    - Add policy for users to insert direct messages
    - Add policy for users to update direct messages they sent
    - Add policy for recipients to mark messages as read
*/

CREATE TABLE IF NOT EXISTS direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false
);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read direct messages they sent or received
CREATE POLICY "Users can read their direct messages"
  ON direct_messages
  FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Policy to allow users to insert direct messages
CREATE POLICY "Users can send direct messages"
  ON direct_messages
  FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Policy to allow users to update direct messages they sent
CREATE POLICY "Users can update their sent messages"
  ON direct_messages
  FOR UPDATE
  USING (sender_id = auth.uid());

-- Policy to allow recipients to mark messages as read
CREATE POLICY "Recipients can mark messages as read"
  ON direct_messages
  FOR UPDATE
  USING (
    recipient_id = auth.uid()
    AND (
      (old.is_read = false AND new.is_read = true)
      OR (old.is_read = true AND new.is_read = true)
    )
  );