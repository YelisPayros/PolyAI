CREATE TABLE chats (
  chat_id TEXT PRIMARY KEY,
  user_uuid UUID REFERENCES auth.users(id),
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX chats_user_uuid_idx ON chats (user_uuid);
