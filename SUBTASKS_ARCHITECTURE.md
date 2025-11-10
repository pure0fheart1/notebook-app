# Sub-tasks Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                      (NoteEditor.tsx)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Checklist Items List                                      │   │
│  │                                                            │   │
│  │  ▼ Main Item 1 (2/3)                        [+] [🗑]     │   │
│  │    ☑ Sub-task 1                              [🗑]         │   │
│  │    ☑ Sub-task 2                              [🗑]         │   │
│  │    ☐ Sub-task 3                              [🗑]         │   │
│  │                                                            │   │
│  │  ▶ Main Item 2 (0/2)                        [+] [🗑]     │   │
│  │                                                            │   │
│  │  ☐ Main Item 3 (no subtasks)                   [🗑]      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  State Management:                                               │
│  - expandedItems: Set<itemId>                                   │
│  - selectedParentItemId: string | null                          │
│  - subtasksByItem: Record<itemId, Subtask[]>                   │
└─────────────────────────────────────────────────────────────────┘
                             ↕
┌─────────────────────────────────────────────────────────────────┐
│                      REACT QUERY LAYER                           │
│                                                                  │
│  useChecklistItems(noteId)                                      │
│  ├─ Fetches main checklist items                               │
│  ├─ Manages item CRUD operations                               │
│  └─ Returns: items[], addItem(), toggleItem(), deleteItem()    │
│                                                                  │
│  useChecklistSubtasksForItems(itemIds[])                       │
│  ├─ Fetches all subtasks for multiple items in 1 query        │
│  ├─ Groups subtasks by item_id                                 │
│  └─ Returns: subtasksByItem: { itemId: Subtask[] }            │
│                                                                  │
│  Query Keys:                                                    │
│  - ['checklist_items', noteId]                                 │
│  - ['checklist_subtasks_bulk', itemIds.join(',')]             │
│                                                                  │
│  Cache Strategy:                                                │
│  - Stale Time: 60 seconds                                      │
│  - Optimistic Updates: Immediate UI response                   │
│  - Auto Invalidation: On mutations                             │
└─────────────────────────────────────────────────────────────────┘
                             ↕
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE CLIENT                             │
│                                                                  │
│  API Calls:                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ supabase.from('checklist_subtasks')                      │   │
│  │   .select('*')                                            │   │
│  │   .in('item_id', itemIds)                                │   │
│  │   .order('order_index')                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Mutations:                                                     │
│  - INSERT: Create new subtask                                  │
│  - UPDATE: Toggle checked, update text                         │
│  - DELETE: Remove subtask                                      │
└─────────────────────────────────────────────────────────────────┘
                             ↕
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│                      (PostgreSQL)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────┐        ┌──────────────────────┐     │
│  │   checklist_items      │        │ checklist_subtasks   │     │
│  ├────────────────────────┤        ├──────────────────────┤     │
│  │ id (PK)               │◄───────┤ item_id (FK)        │     │
│  │ note_id (FK)          │        │ id (PK)             │     │
│  │ text                  │        │ text                │     │
│  │ checked               │        │ checked             │     │
│  │ order_index           │        │ order_index         │     │
│  │ created_at            │        │ created_at          │     │
│  │ updated_at            │        │ updated_at          │     │
│  └────────────────────────┘        └──────────────────────┘     │
│                                                                  │
│  Indexes:                                                       │
│  - idx_checklist_subtasks_item_id (item_id)                    │
│  - idx_checklist_subtasks_order (item_id, order_index)        │
│                                                                  │
│  RLS Policies:                                                  │
│  - SELECT: User owns notebook → note → item → subtask          │
│  - INSERT: Same ownership chain                                │
│  - UPDATE: Same ownership chain                                │
│  - DELETE: Same ownership chain                                │
│                                                                  │
│  Triggers:                                                      │
│  - update_checklist_subtasks_updated_at (BEFORE UPDATE)        │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Creating a Sub-task

```
User Action: Click "+" button on item
         ↓
UI: Open modal, set selectedParentItemId
         ↓
User: Enter text, click "Add Sub-task"
         ↓
Handler: handleAddSubtask()
         ↓
Validation: Check text.trim() && selectedParentItemId
         ↓
Supabase: INSERT INTO checklist_subtasks
         ↓
Optimistic Update: Add to UI immediately
         ↓
Backend Response: Success or Error
         ↓
On Success: Invalidate queries, show toast, expand parent
         ↓
On Error: Rollback optimistic update, show error toast
         ↓
UI: Updated with new sub-task
```

### Toggling a Sub-task

```
User Action: Click checkbox on sub-task
         ↓
Handler: handleToggleSubtask(subtaskId, itemId)
         ↓
Find: Locate subtask in subtasksByItem[itemId]
         ↓
Optimistic Update: Toggle checked in cache
         ↓
Supabase: UPDATE checklist_subtasks SET checked = !checked
         ↓
Query Invalidation: Refresh both subtasks and items
         ↓
UI: Progress counter updates automatically
```

### Progress Calculation

```
Checklist Items: [Item1, Item2, Item3]
         ↓
Subtasks by Item: {
  Item1: [Sub1, Sub2, Sub3],
  Item2: [Sub4, Sub5],
  Item3: []
}
         ↓
Count Total:
  - Main items: 3
  - Subtasks: 3 + 2 + 0 = 5
  - Total: 8
         ↓
Count Completed:
  - Main items checked: 2
  - Subtasks checked: 2 + 1 + 0 = 3
  - Completed: 5
         ↓
Calculate: 5 / 8 * 100 = 62.5%
         ↓
Display: "5/8" and "62%"
```

## Component Hierarchy

```
NoteEditor
├── Header
│   ├── Back Button
│   ├── Auto-save Indicator
│   └── Action Buttons (Pin, Delete)
│
├── Stats Bar
│   ├── Note Type Badge
│   ├── Progress Card (includes subtask count)
│   └── Items Count
│
├── Title Input
│
├── Content Area
│   └── Checklist Items (if is_checklist)
│       └── For each item:
│           ├── Main Item Row
│           │   ├── Expand/Collapse Chevron (if has subtasks)
│           │   ├── Checkbox
│           │   ├── Item Text
│           │   ├── Progress Counter "(2/5)"
│           │   └── Action Buttons
│           │       ├── Add Subtask [+]
│           │       └── Delete Item [🗑]
│           │
│           └── Subtasks Container (if expanded)
│               └── For each subtask:
│                   ├── Checkbox (smaller)
│                   ├── Subtask Text
│                   └── Delete Button [🗑]
│
└── Modals
    ├── Add Item Modal
    ├── Add Subtask Modal
    │   ├── Header
    │   ├── Text Input (500 char limit)
    │   └── Actions (Cancel, Submit)
    └── Delete Confirmation Dialog
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                  Component State                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  expandedItems: Set<string>                             │
│  ├─ Tracks which items show their subtasks              │
│  └─ Toggled by clicking chevron                         │
│                                                          │
│  selectedParentItemId: string | null                    │
│  ├─ Currently selected item for adding subtask          │
│  └─ Set when clicking [+] button                        │
│                                                          │
│  addSubtaskModalOpen: boolean                           │
│  ├─ Controls subtask modal visibility                   │
│  └─ Opened/closed with selectedParentItemId             │
│                                                          │
│  newSubtaskText: string                                 │
│  ├─ Input value in subtask modal                        │
│  └─ Cleared on submit/cancel                            │
└─────────────────────────────────────────────────────────┘
         ↕
┌─────────────────────────────────────────────────────────┐
│                   React Query Cache                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ['checklist_items', noteId]                            │
│  └─ Main checklist items                                │
│                                                          │
│  ['checklist_subtasks_bulk', itemIds]                   │
│  └─ All subtasks grouped by item_id                     │
│                                                          │
│  Cache Interactions:                                    │
│  ├─ Optimistic Update: Immediate cache modification     │
│  ├─ Invalidate: Trigger refetch on mutations            │
│  └─ Rollback: Restore previous on error                 │
└─────────────────────────────────────────────────────────┘
```

## Security Flow (RLS)

```
┌──────────────────────────────────────────────────────┐
│ User makes request to checklist_subtasks             │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│ RLS Policy Check: "Can user access this subtask?"    │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│ Step 1: Get subtask's item_id                        │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│ Step 2: Find checklist_item (note_id)                │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│ Step 3: Find note (notebook_id)                      │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│ Step 4: Find notebook (user_id)                      │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│ Step 5: Check if user_id = auth.uid()                │
└──────────────────────────────────────────────────────┘
                     ↓
         ┌──────────┴──────────┐
         ↓                     ↓
┌─────────────────┐   ┌─────────────────┐
│ YES: Allow      │   │ NO: Deny        │
│ Access granted  │   │ Return empty    │
└─────────────────┘   └─────────────────┘
```

## Performance Optimization

### Query Strategy

```
❌ BAD: Individual fetches per item
┌─────────────────────────────────────┐
│ For each item:                      │
│   fetch subtasks WHERE item_id = X  │
└─────────────────────────────────────┘
Result: N queries for N items
        Lots of network overhead
        Multiple renders

✅ GOOD: Bulk fetch
┌─────────────────────────────────────┐
│ fetch all subtasks                  │
│   WHERE item_id IN (X, Y, Z)        │
│ Group by item_id in memory          │
└─────────────────────────────────────┘
Result: 1 query for N items
        Minimal network overhead
        Single render
```

### Cache Strategy

```
Request Timeline:
0ms    User clicks checkbox
       ├─ Optimistic update: Cache modified
       └─ UI updates instantly

50ms   API request sent to Supabase

200ms  Response received
       ├─ Success: Invalidate & refetch
       │  └─ Update with server data
       │
       └─ Error: Rollback cache
          └─ Show error toast

60s    Cache becomes stale
       └─ Next access triggers background refetch
```

## File Organization

```
notebook-app/
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_add_checklist_subtasks.sql ← NEW
│
├── src/
│   ├── hooks/
│   │   ├── useChecklistItems.ts
│   │   └── useChecklistSubtasks.ts ← NEW
│   │
│   ├── pages/
│   │   └── NoteEditor.tsx ← MODIFIED
│   │
│   └── services/
│       └── supabase.ts
│
└── docs/
    ├── SUBTASKS_FEATURE.md ← NEW
    ├── SUBTASKS_QUICK_START.md ← NEW
    ├── SUBTASKS_IMPLEMENTATION_SUMMARY.md ← NEW
    └── SUBTASKS_ARCHITECTURE.md ← NEW (this file)
```

## API Contract

### useChecklistSubtasksForItems

```typescript
Input:
  itemIds: string[]

Output:
  {
    subtasksByItem: {
      [itemId: string]: ChecklistSubtask[]
    },
    isLoading: boolean,
    error: Error | null
  }

Example:
  itemIds = ['item-1', 'item-2', 'item-3']

  subtasksByItem = {
    'item-1': [
      { id: 'sub-1', text: 'Subtask 1', checked: true, ... },
      { id: 'sub-2', text: 'Subtask 2', checked: false, ... }
    ],
    'item-2': [
      { id: 'sub-3', text: 'Subtask 3', checked: false, ... }
    ],
    'item-3': [] // No subtasks
  }
```

### handleAddSubtask

```typescript
Input:
  - newSubtaskText: string (from modal input)
  - selectedParentItemId: string (from state)

Validation:
  1. newSubtaskText.trim() !== ''
  2. selectedParentItemId !== null
  3. text.length <= 500

Process:
  1. Insert into checklist_subtasks
  2. Invalidate cache
  3. Expand parent item
  4. Close modal
  5. Reset state

Output:
  - Success: Toast + UI update
  - Error: Toast + no change
```

## Error Handling

```
┌─────────────────────────────────────────┐
│ User Action (e.g., add subtask)         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ Client-side Validation                  │
│ ├─ Text not empty                       │
│ ├─ Length <= 500 chars                  │
│ └─ Parent item exists                   │
└─────────────────────────────────────────┘
              ↓
        Valid? ────No──→ Show error toast
              ↓
             Yes
              ↓
┌─────────────────────────────────────────┐
│ Optimistic Update                       │
│ └─ Add to cache immediately             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ API Request to Supabase                 │
└─────────────────────────────────────────┘
              ↓
        ┌─────┴─────┐
        ↓           ↓
    Success      Error
        ↓           ↓
┌──────────┐  ┌──────────────┐
│Invalidate│  │Rollback Cache│
│ Queries  │  │Show Error    │
│Show Toast│  │Toast         │
└──────────┘  └──────────────┘
```

## Deployment Checklist

```
Pre-deployment:
□ Review all code changes
□ Test locally with real data
□ Verify RLS policies
□ Check migration syntax
□ Backup database

Deployment:
□ Apply migration
□ Verify tables created
□ Test RLS policies
□ Check indexes exist
□ Monitor for errors

Post-deployment:
□ Create test checklist
□ Add subtasks
□ Verify progress calculation
□ Test expand/collapse
□ Monitor performance
□ Gather user feedback
```

---

This architecture provides a solid foundation for hierarchical task management with room for future enhancements like multi-level nesting, drag-and-drop reordering, and advanced filtering.
