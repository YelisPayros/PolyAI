-- 1. Agregar el campo created_at con timestamp por defecto
ALTER TABLE chats
ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();

-- 2. Habilitar RLS si aún no está activo
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- 3. Crear política "Enable read access for all users"
CREATE POLICY "Enable read access for all users"
ON chats
AS PERMISSIVE
FOR ALL
TO public
USING (
  user_uuid = auth.uid()
)
WITH CHECK (
  user_uuid = auth.uid()
);
