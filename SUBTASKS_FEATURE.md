# Checklist Sub-tasks Feature Documentation

## Overview

The sub-tasks feature extends the checklist functionality by allowing hierarchical task organization. Users can now create sub-tasks under main checklist items, providing better organization for complex projects and task breakdowns.

## Features

### 1. Hierarchical Task Structure
- Main checklist items can have multiple sub-tasks
- Sub-tasks are indented and visually grouped under their parent item
- Unlimited nesting depth (currently one level deep for simplicity)

### 2. Visual Indicators
- **Expand/Collapse Icons**: Items with sub-tasks display chevron icons (right/down)
- **Progress Counter**: Each item with sub-tasks shows completion status (e.g., "2/5")
- **Indentation**: Sub-tasks are indented 48px (ml-12) for clear hierarchy

### 3. Independent Task Management
- Sub-tasks can be checked/unchecked independently
- Each sub-task has its own delete button
- Sub-tasks automatically update parent item's progress counter

### 4. Smart Progress Calculation
- Overall progress includes both main items and sub-tasks
- Formula: `(completed_items + completed_subtasks) / (total_items + total_subtasks) * 100`
- Real-time updates as tasks are completed

## Database Schema

### Table: `checklist_subtasks`

```sql
CREATE TABLE checklist_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes
- `idx_checklist_subtasks_item_id`: Fast lookups by parent item
- `idx_checklist_subtasks_order`: Efficient ordering within parent

### Row Level Security (RLS)
- Users can only view/modify subtasks in their own notes
- Policies cascade through: user → notebook → note → item → subtask

## File Structure

### New Files Created

1. **Migration File**: `supabase/migrations/002_add_checklist_subtasks.sql`
   - Creates `checklist_subtasks` table
   - Sets up indexes and RLS policies
   - Adds triggers for `updated_at` column

2. **Hook File**: `src/hooks/useChecklistSubtasks.ts`
   - Exports `useChecklistSubtasks` hook for single item
   - Exports `useChecklistSubtasksForItems` hook for bulk fetching
   - Provides CRUD operations with optimistic updates

### Modified Files

1. **NoteEditor.tsx**: `src/pages/NoteEditor.tsx`
   - Added sub-task UI rendering
   - Implemented expand/collapse functionality
   - Updated progress calculation
   - Added sub-task modal

## API Reference

### useChecklistSubtasks Hook

```typescript
const {
  subtasks,           // ChecklistSubtask[] - Array of subtasks
  isLoading,          // boolean - Loading state
  error,              // Error | null - Error state
  addSubtask,         // (params) => void - Create subtask
  updateSubtask,      // (params) => void - Update subtask
  deleteSubtask,      // (params) => void - Delete subtask
  toggleSubtask,      // (params) => void - Toggle checked state
  reorderSubtasks,    // (params) => void - Reorder subtasks
  isAdding,           // boolean - Creating state
  isUpdating,         // boolean - Updating state
  isDeleting,         // boolean - Deleting state
  isToggling,         // boolean - Toggling state
  isReordering,       // boolean - Reordering state
} = useChecklistSubtasks(itemId)
```

### useChecklistSubtasksForItems Hook

```typescript
const {
  subtasksByItem,     // Record<string, ChecklistSubtask[]> - Subtasks grouped by item ID
  isLoading,          // boolean - Loading state
  error,              // Error | null - Error state
} = useChecklistSubtasksForItems(itemIds)
```

### ChecklistSubtask Interface

```typescript
interface ChecklistSubtask {
  id: string
  item_id: string
  text: string
  checked: boolean
  order_index: number
  created_at: string
  updated_at: string
}
```

## User Interface

### Add Sub-task
1. Hover over a checklist item
2. Click the small "+" icon that appears
3. Enter sub-task text in the modal (max 500 characters)
4. Click "Add Sub-task" or press Cmd/Ctrl+Enter

### Toggle Sub-task
1. Click the checkbox next to any sub-task
2. Progress updates automatically

### Delete Sub-task
1. Hover over a sub-task
2. Click the trash icon that appears
3. Sub-task is deleted immediately (no confirmation)

### Expand/Collapse Items
1. Click the chevron icon (▶/▼) next to items with sub-tasks
2. Toggles visibility of all sub-tasks under that item
3. State is maintained during the session

## Optimistic Updates

All operations use optimistic updates for instant UI feedback:

1. **Create**: Temporary ID assigned, subtask appears immediately
2. **Update**: Changes reflect instantly, rolled back on error
3. **Delete**: Removed from UI immediately, restored on error
4. **Toggle**: Checkbox state changes instantly

## Progress Calculation

### Before Sub-tasks
```typescript
completed / total * 100
```

### With Sub-tasks
```typescript
const totalItems = items.length + sum(subtasks.length)
const completedItems = items.filter(checked).length + sum(subtasks.filter(checked).length)
progress = completedItems / totalItems * 100
```

### Example
- 3 main items (2 checked)
- Item 1: 2 sub-tasks (1 checked)
- Item 2: 3 sub-tasks (2 checked)
- Total: 8 tasks, 5 completed = 62.5% progress

## Styling

### Main Item Row
- Padding: `p-3`
- Hover: Light gray background
- Gap: `gap-2` between elements

### Sub-task Row
- Padding: `p-2` (slightly less than main items)
- Indentation: `ml-12` (48px left margin)
- Font size: `text-base` (16px, smaller than main items)
- Checkbox: Smaller (w-5 h-5 vs w-6 h-6)

### Icons
- Chevron: 20px (w-5 h-5)
- Main checkbox: 24px (w-6 h-6)
- Sub-task checkbox: 20px (w-5 h-5)
- Action buttons: Appear on hover

## Performance Optimizations

1. **Bulk Fetching**: `useChecklistSubtasksForItems` fetches all subtasks in one query
2. **Query Caching**: 1-minute stale time reduces unnecessary requests
3. **Optimistic Updates**: Instant UI feedback without waiting for server
4. **Grouped Data**: Subtasks pre-grouped by item ID for O(1) lookups

## Database Migration

### To Apply Migration

```bash
# Navigate to project directory
cd Desktop/Projects/notebook-app

# Apply migration through Supabase
supabase db push
```

Or apply directly in Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `supabase/migrations/002_add_checklist_subtasks.sql`
3. Run the query

### Rollback (if needed)

```sql
-- Drop table and all related objects
DROP TABLE IF EXISTS checklist_subtasks CASCADE;
```

## Testing Checklist

- [ ] Create a checklist note
- [ ] Add main checklist item
- [ ] Add sub-task to item (click + icon)
- [ ] Verify sub-task appears indented
- [ ] Toggle sub-task checkbox
- [ ] Verify progress counter updates
- [ ] Add multiple sub-tasks
- [ ] Expand/collapse item (click chevron)
- [ ] Delete a sub-task
- [ ] Delete main item (verify sub-tasks cascade delete)
- [ ] Create sub-task with 500 characters
- [ ] Try creating sub-task with 501 characters (should fail)
- [ ] Check RLS: Log in as different user, verify no access to other users' subtasks
- [ ] Test optimistic updates by throttling network
- [ ] Verify progress calculation with mixed checked/unchecked items

## Known Limitations

1. **Single Level**: Currently supports one level of nesting (no sub-sub-tasks)
2. **No Reordering UI**: Subtasks can't be reordered via drag-and-drop yet
3. **No Bulk Operations**: Can't select and delete multiple sub-tasks at once
4. **No Sub-task Search**: Search doesn't currently index sub-task content

## Future Enhancements

1. **Multi-level Nesting**: Support unlimited nesting depth
2. **Drag-and-Drop**: Reorder sub-tasks and promote/demote hierarchy
3. **Bulk Actions**: Select multiple sub-tasks for batch operations
4. **Templates**: Create sub-task templates for common workflows
5. **Dependencies**: Mark sub-tasks as blocking/dependent
6. **Auto-completion**: Auto-check parent when all sub-tasks complete
7. **Collapse All**: Button to expand/collapse all items at once
8. **Search Integration**: Include sub-task text in note search
9. **Keyboard Shortcuts**: Quick navigation between sub-tasks
10. **Sub-task Notes**: Add descriptions/notes to individual sub-tasks

## Troubleshooting

### Sub-tasks not appearing
- Check browser console for errors
- Verify migration was applied: `SELECT * FROM checklist_subtasks LIMIT 1;`
- Check RLS policies: Ensure user is authenticated
- Clear browser cache and reload

### Progress not updating
- Check that `subtasksByItem` is populated
- Verify `useChecklistSubtasksForItems` is called with correct item IDs
- Check for console errors in progress calculation

### Can't add sub-tasks
- Verify note exists and is a checklist
- Check that parent item ID is valid
- Ensure user has permission to modify the note
- Check network tab for API errors

### Performance issues
- Check number of items and sub-tasks (optimize if >100 total)
- Verify indexes exist on `checklist_subtasks` table
- Monitor query performance in Supabase dashboard
- Consider pagination for very large checklists

## Support

For issues or questions:
1. Check this documentation
2. Review code comments in `useChecklistSubtasks.ts`
3. Check browser console for errors
4. Verify database schema matches migration
5. Test with a fresh checklist to isolate issues

---

**Version**: 1.0.0
**Last Updated**: 2025-01-10
**Author**: Claude Code Assistant
