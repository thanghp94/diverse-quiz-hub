
-- Add the new columns to the existing content table without dropping it
ALTER TABLE content 
ADD COLUMN IF NOT EXISTS mindmap text,
ADD COLUMN IF NOT EXISTS mindmapurl text,
ADD COLUMN IF NOT EXISTS classdone text,
ADD COLUMN IF NOT EXISTS studentseen text,
ADD COLUMN IF NOT EXISTS show text,
ADD COLUMN IF NOT EXISTS showtranslation text,
ADD COLUMN IF NOT EXISTS showstudent text,
ADD COLUMN IF NOT EXISTS typeoftaking text,
ADD COLUMN IF NOT EXISTS header text;

-- Rename existing columns to match the new schema if they don't already exist
-- (These will only run if the columns don't already have the correct names)
DO $$ 
BEGIN 
    -- Check and rename columns if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content' AND column_name = 'Order') THEN
        ALTER TABLE content RENAME COLUMN "Order" TO "order";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content' AND column_name = 'Translation') THEN
        ALTER TABLE content RENAME COLUMN "Translation" TO translation;
    END IF;
EXCEPTION 
    WHEN duplicate_column THEN 
        -- Column already exists with correct name, continue
        NULL;
END $$;

-- Add Row Level Security if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'content' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE content ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create a policy to allow read access to all users (since this appears to be educational content)
DROP POLICY IF EXISTS "Allow read access to content" ON content;
CREATE POLICY "Allow read access to content" ON content FOR SELECT USING (true);

-- Create indexes for performance (only if they don't already exist)
CREATE INDEX IF NOT EXISTS idx_content_topicid ON content(topicid);
CREATE INDEX IF NOT EXISTS idx_content_parentid ON content(parentid);
CREATE INDEX IF NOT EXISTS idx_content_order ON content("order");
