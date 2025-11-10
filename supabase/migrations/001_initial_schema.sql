-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create notebooks table
CREATE TABLE notebooks (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create notes table
CREATE TABLE notes (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content JSONB,
  is_checklist BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create checklist_items table
CREATE TABLE checklist_items (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create tags table
CREATE TABLE tags (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#0ea5e9',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create note_tags junction table
CREATE TABLE note_tags (
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  PRIMARY KEY (note_id, tag_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX idx_notebooks_created_at ON notebooks(created_at DESC);
CREATE INDEX idx_notes_notebook_id ON notes(notebook_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_checklist_items_note_id ON checklist_items(note_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_note_tags_note_id ON note_tags(note_id);
CREATE INDEX idx_note_tags_tag_id ON note_tags(tag_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create RLS policies for notebooks
CREATE POLICY "Users can view their own notebooks"
  ON notebooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notebooks"
  ON notebooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notebooks"
  ON notebooks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notebooks"
  ON notebooks FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for notes
CREATE POLICY "Users can view notes in their notebooks"
  ON notes FOR SELECT
  USING (
    notebook_id IN (
      SELECT id FROM notebooks WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert notes in their notebooks"
  ON notes FOR INSERT
  WITH CHECK (
    notebook_id IN (
      SELECT id FROM notebooks WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notes in their notebooks"
  ON notes FOR UPDATE
  USING (
    notebook_id IN (
      SELECT id FROM notebooks WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete notes in their notebooks"
  ON notes FOR DELETE
  USING (
    notebook_id IN (
      SELECT id FROM notebooks WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for checklist_items
CREATE POLICY "Users can view checklist items in their notes"
  ON checklist_items FOR SELECT
  USING (
    note_id IN (
      SELECT notes.id FROM notes
      INNER JOIN notebooks ON notes.notebook_id = notebooks.id
      WHERE notebooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert checklist items in their notes"
  ON checklist_items FOR INSERT
  WITH CHECK (
    note_id IN (
      SELECT notes.id FROM notes
      INNER JOIN notebooks ON notes.notebook_id = notebooks.id
      WHERE notebooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update checklist items in their notes"
  ON checklist_items FOR UPDATE
  USING (
    note_id IN (
      SELECT notes.id FROM notes
      INNER JOIN notebooks ON notes.notebook_id = notebooks.id
      WHERE notebooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete checklist items in their notes"
  ON checklist_items FOR DELETE
  USING (
    note_id IN (
      SELECT notes.id FROM notes
      INNER JOIN notebooks ON notes.notebook_id = notebooks.id
      WHERE notebooks.user_id = auth.uid()
    )
  );

-- Create RLS policies for tags
CREATE POLICY "Users can view their own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
  ON tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for note_tags
CREATE POLICY "Users can view note_tags for their notes"
  ON note_tags FOR SELECT
  USING (
    note_id IN (
      SELECT notes.id FROM notes
      INNER JOIN notebooks ON notes.notebook_id = notebooks.id
      WHERE notebooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert note_tags for their notes"
  ON note_tags FOR INSERT
  WITH CHECK (
    note_id IN (
      SELECT notes.id FROM notes
      INNER JOIN notebooks ON notes.notebook_id = notebooks.id
      WHERE notebooks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete note_tags for their notes"
  ON note_tags FOR DELETE
  USING (
    note_id IN (
      SELECT notes.id FROM notes
      INNER JOIN notebooks ON notes.notebook_id = notebooks.id
      WHERE notebooks.user_id = auth.uid()
    )
  );

-- Create trigger function for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notebooks_updated_at BEFORE UPDATE ON notebooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();