"use server"

import { createClient } from "@/lib/supabase/server"

export async function getTasks() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      client:client_id (id, name)
    `)
    .order('due_date', { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  if (!data || data.length === 0) return []

  // Fetch profiles for assignee and creator
  const profileIds = new Set<string>()
  data.forEach((task: any) => {
    if (task.assignee_id) profileIds.add(task.assignee_id)
    if (task.creator_id) profileIds.add(task.creator_id)
  })

  if (profileIds.size > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, role')
      .in('id', Array.from(profileIds))

    if (profiles) {
      const profileMap = new Map(profiles.map(p => [p.id, p]))
      data.forEach((task: any) => {
        if (task.assignee_id) task.assignee = profileMap.get(task.assignee_id)
        if (task.creator_id) task.creator = profileMap.get(task.creator_id)
      })
    }
  }

  return data
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
