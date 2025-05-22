/*
  # Create messages table

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `content` (text)
      - `channel_id` (uuid, references channels.id)
      - `user_id` (uuid, references profiles.id)
      - `created_at` (timestamptz)
      - `is_edited` (boolean)
  2. Security
    - Enable RLS on `messages` table
    - Add policy for users to read messages in channels they have access to
    - Add policy for users to insert messages in channels they have access to
    - Add policy for users to update their own messages
    - Add policy for users to delete their own messages
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  is_edited boolean DEFAULT false
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read messages in channels they have access to
CREATE POLICY "Users can read messages in accessible channels"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE id = channel_id
      AND (
        is_private = false
        OR (
          is_private = true
          AND EXISTS (
            SELECT 1 FROM channel_members
            WHERE channel_id = messages.channel_id
            AND user_id = auth.uid()
          )
        )
      )
    )
  );

-- Policy to allow users to insert messages in channels they have access to
CREATE POLICY "Users can insert messages in accessible channels"
  ON messages
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM channels
      WHERE id = channel_id
      AND (
        is_private = false
        OR (
          is_private = true
          AND EXISTS (
            SELECT 1 FROM channel_members
            WHERE channel_id = messages.channel_id
            AND user_id = auth.uid()
          )
        )
      )
    )
  );

-- Policy to allow users to update their own messages
CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy to allow users to delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON messages
  FOR DELETE
  USING (user_id = auth.uid());