"use server"

import { createClient } from "@/lib/supabase/server"

export async function getTasks() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      client:client_id (id, name, company),
      assignee:assignee_id (id, name, role),
      creator:creator_id (id, name)
    `)
    .order('due_date', { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  return data || []
}

export async function createTask(taskData: any) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Inject creator
  const payload = {
    ...taskData,
    creator_id: user.id
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([payload])
    .select()
    .single()

  if (error) {
    console.error("Error creating task:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function updateTask(taskId: string, updates: any) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()

  if (error) {
    console.error("Error updating task:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    console.error("Error deleting task:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
