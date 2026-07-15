"use server"

import { createClient } from "@/lib/supabase/server"

export async function getAppetiteRules() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("appetite_rules")
    .select("*")
    .order("carrier_name", { ascending: true })

  if (error) {
    console.error("Error fetching appetite rules:", error)
    return []
  }

  return data
}
