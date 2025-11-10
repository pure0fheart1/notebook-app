# Sub-tasks Quick Start Guide

## 🚀 Getting Started

### Step 1: Apply Database Migration

```bash
cd Desktop/Projects/notebook-app
```

Then either:

**Option A: Using Supabase CLI**
```bash
supabase db push
```

**Option B: Manual Application**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents from `supabase/migrations/002_add_checklist_subtasks.sql`
3. Execute the query

### Step 2: Verify Installation

Run this query in Supabase SQL Editor:
```sql
SELECT * FROM checklist_subtasks LIMIT 1;
```

If no errors, you're ready!

## 📝 How to Use

### Creating Sub-tasks

1. **Open a checklist note**
2. **Hover over any checklist item**
3. **Click the small "+" icon** (appears on hover)
4. **Type your sub-task** in the modal
5. **Press "Add Sub-task"** or Cmd/Ctrl+Enter

### Managing Sub-tasks

**Expand/Collapse**
- Click the ▶ or ▼ icon next to items with sub-tasks

**Check/Uncheck**
- Click the checkbox next to any sub-task

**Delete**
- Hover over sub-task
- Click the trash icon

## 🎯 Example Workflow

Let's create a project plan:

1. Create checklist item: "Build Website"
2. Hover and click "+" to add sub-tasks:
   - Design mockups
   - Set up hosting
   - Build frontend
   - Deploy to production

3. The item now shows: **Build Website (0/4)**
4. As you complete sub-tasks, the counter updates: **(2/4)**
5. Overall progress bar includes all items + sub-tasks

## 🎨 Visual Features

### What You'll See

```
▼ Build Website (2/4)          [+] [🗑]
    ☑ Design mockups           [🗑]
    ☑ Set up hosting           [🗑]
    ☐ Build frontend           [🗑]
    ☐ Deploy to production     [🗑]

▶ Plan Marketing (0/3)         [+] [🗑]

▶ Test Application (1/2)       [+] [🗑]
```

### Icons Explained
- **▶**: Collapsed (sub-tasks hidden)
- **▼**: Expanded (sub-tasks visible)
- **☑**: Checked task/sub-task
- **☐**: Unchecked task/sub-task
- **(2/4)**: Progress counter (2 done, 4 total)
- **[+]**: Add sub-task (hover only)
- **[🗑]**: Delete (hover only)

## 💡 Pro Tips

### Keyboard Shortcuts
- **Cmd/Ctrl+Enter**: Submit sub-task modal
- **Esc**: Close modal (when implemented)

### Best Practices
1. **Keep sub-tasks focused**: Each should be a single action
2. **Use progress counters**: Glance at (2/5) to see remaining work
3. **Expand when active**: Collapse completed items to reduce clutter
4. **Limit depth**: Stay at one level for clarity

### Common Patterns

**Project Breakdown**
```
▼ Launch Product
    ☐ Complete development
    ☐ QA testing
    ☐ Marketing materials
    ☐ Deploy to production
```

**Shopping List**
```
▼ Groceries
    ☐ Milk
    ☐ Bread
    ☐ Eggs
▼ Hardware Store
    ☐ Light bulbs
    ☐ Paint
```

**Learning Goals**
```
▼ Learn React
    ☑ Understand JSX
    ☑ Master hooks
    ☐ Build 3 projects
    ☐ Deploy an app
```

## 🔧 Technical Details

### Data Flow
1. Click "Add sub-task" → Open modal
2. Enter text → Validate (max 500 chars)
3. Submit → Optimistic update (instant UI)
4. Backend save → Update cache
5. On success → Invalidate queries
6. On error → Rollback optimistic update

### Smart Progress
- Formula: `(completed / total) * 100`
- Total = main items + all sub-tasks
- Completed = checked items + checked sub-tasks
- Updates in real-time

## 🐛 Troubleshooting

**Sub-tasks not showing?**
- Refresh the page
- Check browser console for errors
- Verify database migration applied

**Can't add sub-tasks?**
- Ensure you're logged in
- Verify the note exists
- Check parent item is valid

**Progress not updating?**
- Hard refresh (Cmd/Ctrl+Shift+R)
- Check all items loaded
- Verify no console errors

## 📚 Related Files

- **Migration**: `supabase/migrations/002_add_checklist_subtasks.sql`
- **Hook**: `src/hooks/useChecklistSubtasks.ts`
- **UI**: `src/pages/NoteEditor.tsx`
- **Docs**: `SUBTASKS_FEATURE.md`

## ✅ Quick Test

Try this:
1. Create a checklist called "Test Sub-tasks"
2. Add item: "Main Task"
3. Hover and add sub-task: "Subtask 1"
4. Add another: "Subtask 2"
5. Click chevron to expand/collapse
6. Check both sub-tasks
7. Watch progress update to 100%
8. Success! 🎉

## 🚨 Important Notes

- **Character Limit**: 500 characters per sub-task
- **Nesting Depth**: Currently one level (no sub-sub-tasks)
- **Deletion**: Deleting parent item deletes all sub-tasks
- **Privacy**: RLS ensures you only see your sub-tasks

## 🎓 Learning Resources

**Want to understand the code?**
1. Read `useChecklistSubtasks.ts` for data management
2. Check `NoteEditor.tsx` lines 638-784 for UI
3. Review migration for database schema
4. See `SUBTASKS_FEATURE.md` for deep dive

## 📞 Need Help?

1. Check `SUBTASKS_FEATURE.md` for detailed documentation
2. Review console errors
3. Verify database schema
4. Test with fresh checklist

---

**Happy organizing!** 📋✨
