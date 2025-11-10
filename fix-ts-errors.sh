#!/bin/bash

# Fix ConfirmDialog - remove unused Fragment import
sed -i "1d" src/components/ConfirmDialog.tsx

# Fix unused variables in hooks
sed -i 's/onError: (error, { id }, context)/onError: (error, { id: _id }, context)/g' src/hooks/useChecklistItems.ts
sed -i 's/onError: (error, { noteId }, context)/onError: (error, { noteId: _noteId }, context)/g' src/hooks/useChecklistItems.ts
sed -i 's/onError: (error, itemId, context)/onError: (error, _itemId, context)/g' src/hooks/useChecklistItems.ts
sed -i 's/onError: (error, items, context)/onError: (error, _items, context)/g' src/hooks/useChecklistItems.ts
sed -i 's/onSuccess: (data)/onSuccess: (_data)/g' src/hooks/useChecklistItems.ts

# Fix unused variables in useNotes
sed -i 's/onError: (error, { id }, context)/onError: (error, { id: _id }, context)/g' src/hooks/useNotes.ts
sed -i 's/onError: (error, id, context)/onError: (error, _id, context)/g' src/hooks/useNotes.ts
sed -i 's/onError: (error, noteId, context)/onError: (error, _noteId, context)/g' src/hooks/useNotes.ts

# Fix unused variables in useNotebooks
sed -i 's/onError: (error, variables, context)/onError: (error, _variables, context)/g' src/hooks/useNotebooks.ts

# Fix unused variables in Dashboard
sed -i 's/const { notebooks, isLoading, createNotebook, deleteNotebook, updateNotebook } = useNotebooks()/const { notebooks, isLoading, createNotebook, deleteNotebook } = useNotebooks()/g' src/pages/Dashboard.tsx
sed -i 's/const \[editingNotebook, setEditingNotebook\] = useState<Notebook | null>(null)//g' src/pages/Dashboard.tsx
sed -i 's/notes_count={notebook.notes_count || 0}/\/\/ notes_count not available/g' src/pages/Dashboard.tsx

# Fix unused variables in NotebookView
sed -i 's/const noteToDeleteData = notes.find((n) => n.id === noteToDelete)//g' src/pages/NotebookView.tsx

# Fix unused variables in NoteEditor
sed -i 's/const { items: checklistItems, addItem, toggleItem, deleteItem, updateItem, isAdding } =/const { items: checklistItems, addItem, toggleItem, deleteItem, isAdding } =/g' src/pages/NoteEditor.tsx
sed -i 's/{checklistItems.map((item, index) =>/{checklistItems.map((item) =>/g' src/pages/NoteEditor.tsx

echo "TypeScript errors fixed!"
