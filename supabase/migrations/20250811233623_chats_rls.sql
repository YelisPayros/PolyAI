-- 1. Enable Row Level Security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- 2. Allow authenticated users to SELECT only their own chats
CREATE POLICY "Users can select their own chats"
ON chats
FOR SELECT
USING (auth.uid() = user_uuid);

-- 3. Allow authenticated users to INSERT chats only for themselves
CREATE POLICY "Users can insert their own chats"
ON chats
FOR INSERT
WITH CHECK (auth.uid() = user_uuid);

-- 4. Allow authenticated users to UPDATE only their own chats
CREATE POLICY "Users can update their own chats"
ON chats
FOR UPDATE
USING (auth.uid() = user_uuid)
WITH CHECK (auth.uid() = user_uuid);

-- 5. Allow authenticated users to DELETE only their own chats
CREATE POLICY "Users can delete their own chats"
ON chats
FOR DELETE
USING (auth.uid() = user_uuid);
