"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfileName(newName: string) {
  if (!newName || newName.trim() === "") {
    return { success: false, error: "El nombre no puede estar vacío" }
  }

  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "No autenticado" }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ name: newName.trim() })
    .eq('id', user.id)

  if (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: "Error al actualizar el perfil en la base de datos" }
  }

  revalidatePath("/", "layout")
  return { success: true }
}
