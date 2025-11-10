// Extended database types for features not yet in generated types
// This file supplements the Supabase auto-generated types

export interface ChecklistSubtask {
  id: string
  item_id: string
  text: string
  checked: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export type ChecklistSubtaskInsert = Omit<ChecklistSubtask, 'id' | 'created_at' | 'updated_at'>
export type ChecklistSubtaskUpdate = Partial<Omit<ChecklistSubtask, 'id' | 'item_id' | 'created_at' | 'updated_at'>>
