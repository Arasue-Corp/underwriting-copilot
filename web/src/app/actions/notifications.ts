"use server"

import { createClient } from "@/lib/supabase/server"

export async function getNotifications() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      task:task_id (id, note, client_id, due_date)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching notifications:", error)
    return []
  }

  return data || []
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function createNotification(userId: string, taskId: string, title: string, message: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      task_id: taskId,
      title,
      message
    }])

  if (error) {
    console.error("Error creating notification:", error)
    return { success: false, error: error.message }
  }
  return { success: true }
}
