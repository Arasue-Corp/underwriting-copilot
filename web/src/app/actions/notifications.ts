"use server"

import { createClient } from "@/lib/supabase/server"

export async function getNotifications() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching notifications:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false)

  if (error) {
    console.error("Error marking all notifications as read:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function createNotification(userId: string, title: string, message: string, type: string, link?: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title,
      message,
      type,
      link: link || null
    })

  if (error) {
    console.error("Error creating notification:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
