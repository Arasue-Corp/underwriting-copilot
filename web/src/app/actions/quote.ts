"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitQuoteRequest(formData: FormData) {
  const supabase = await createClient()

  // In a real app, these come from the authenticated session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Fetch the agent's profile to get agency_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .single()

  if (!profile) {
    throw new Error("Profile not found")
  }

  const clientName = formData.get("client_name") as string
  const coverageRequested = formData.get("coverage") as string
  const carrierId = formData.get("carrier_name") as string // simplified

  const { error } = await supabase.from("quote_requests").insert({
    agent_id: user.id,
    agency_id: profile.agency_id,
    client_name: clientName,
    client_business_type: "Unknown", // simplified for now
    carrier_id: carrierId,
    coverage_requested: coverageRequested,
    status: "PENDING_MANAGER"
  })

  if (error) {
    console.error("Error submitting quote:", error)
    throw new Error("Failed to submit quote")
  }

  revalidatePath("/appetite")
  revalidatePath("/dashboard")
  
  return { success: true }
}

export async function updateQuoteWithPremium(quoteId: string, premiumAmount: number, pdfPath: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("quote_requests")
    .update({
      premium_amount: premiumAmount,
      pdf_url: pdfPath,
      status: "QUOTED"
    })
    .eq("id", quoteId)

  if (error) {
    console.error("Error updating quote:", error)
    throw new Error("Failed to update quote")
  }

  revalidatePath("/quotes")
  return { success: true }
}
