-- Create checklist_subtasks table for hierarchical sub-tasks
CREATE TABLE checklist_subtasks (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better query performance
CREATE INDEX idx_checklist_subtasks_item_id ON checklist_subtasks(item_id);
CREATE INDEX idx_checklist_subtasks_order ON checklist_subtasks(item_id, order_index);

-- Enable Row Level Security (RLS)
ALTER TABLE checklist_subtasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for checklist_subtasks
-- Users can view subtasks for items in their notes
CREATE POLICY "Users can view checklist subtasks in their notes"
  ON checklist_subtasks FOR SELECT
  USING (
    item_id IN (
      SELECT checklist_items.id FROM checklist_items
      INNER JOIN notes ON checklist_items.note_id = notes.id
      INNER JOIN notebooks ON notes.notebook_id = notebooks.id
      WHERE notebooks.user_id = auth.uid()
    )
  );

-- Users can insert subtasks in their notes
CREATE POLICY "Users can insert checklist subtasks in their notes"
  ON checklist_subtasks FOR INSERT
  WITH CHECK (
    item_id IN (
      SELECT checklist_items.id FROM checklist_items
      INNER JOIN notes ON checklist_items.note_id = notes.id
      INNER JOIN notebooks ON notes.notebook_id = notebooks.id
      WHERE notebooks.user_id = auth.uid()
    )
  );

-- Users can update subtasks in their notes
CREATE POLICY "Users can update checklist subtasks in their notes"
  ON checklist_subtasks FOR UPDATE
  USING (
    item_id IN (
      SELECT checklist_items.id FROM checklist_items
      INNER JOIN notes ON checklist_items.note_id = notes.id
      INNER JOIN notebooks ON notes.notebook_id = notebooks.id
      WHERE notebooks.user_id = auth.uid()
    )
  );

-- Users can delete subtasks in their notes
CREATE POLICY "Users can delete checklist subtasks in their notes"
  ON checklist_subtasks FOR DELETE
  USING (
    item_id IN (
      SELECT checklist_items.id FROM checklist_items
      INNER JOIN notes ON checklist_items.note_id = notes.id
      INNER JOIN notebooks ON notes.notebook_id = notebooks.id
      WHERE notebooks.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_checklist_subtasks_updated_at BEFORE UPDATE ON checklist_subtasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE checklist_subtasks IS 'Sub-tasks that belong to checklist items, enabling hierarchical task organization';
COMMENT ON COLUMN checklist_subtasks.item_id IS 'References the parent checklist item';
COMMENT ON COLUMN checklist_subtasks.order_index IS 'Determines the display order of sub-tasks within their parent item';
