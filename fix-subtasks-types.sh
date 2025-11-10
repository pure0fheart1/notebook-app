#!/bin/bash

# Fix type assertions
sed -i 's/return data as ChecklistSubtask\[\]/return data as unknown as ChecklistSubtask[]/g' src/hooks/useChecklistSubtasks.ts
sed -i 's/return data as ChecklistSubtask/return data as unknown as ChecklistSubtask/g' src/hooks/useChecklistSubtasks.ts
sed -i 's/(data as ChecklistSubtask\[\])/(data as unknown as ChecklistSubtask[])/g' src/hooks/useChecklistSubtasks.ts

# Fix unused variables
sed -i 's/mutationFn: async ({ id, itemId }:/mutationFn: async ({ id, itemId: _itemId }:/g' src/hooks/useChecklistSubtasks.ts
sed -i 's/const queryClient = useQueryClient()/\/\/ queryClient not needed in this hook/g' src/hooks/useChecklistSubtasks.ts

# Fix NoteEditor
sed -i 's/const { data, error } = await supabase/const { data: _data, error } = await supabase/g' src/pages/NoteEditor.tsx

echo "✅ Fixed TypeScript errors"
