"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitQuoteRequest(formData: FormData) {
  try {
    const supabase = await createClient()

    // In a real app, these come from the authenticated session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Fetch the agent's profile to get agency_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("agency_id")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return { success: false, error: "Profile not found" }
    }

    let clientName = formData.get("client_name") as string
    const carrierId = formData.get("carrier_name") as string
    
    const products = JSON.parse((formData.get("products") as string) || "[]")
    const rawFormData = JSON.parse((formData.get("form_data") as string) || "{}")
    
    if (!clientName && rawFormData.general_quote_category === 'personal') {
      clientName = `${rawFormData.general_first_name || ''} ${rawFormData.general_last_name || ''}`.trim()
    }

    // Check if client exists, otherwise create it
    const clientLegalStructure = rawFormData.general_legal_structure || null;
    const clientFein = rawFormData.general_fein || null;
    const clientAddress = rawFormData.general_address || null;
    const clientContact = rawFormData.general_contact || null;
    const clientFirstName = rawFormData.general_first_name || null;
    const clientLastName = rawFormData.general_last_name || null;
    
    // Upsert client
    if (clientName) {
      await supabase
        .from('clients')
        .upsert({
          agency_id: profile.agency_id,
          name: clientName,
          first_name: clientFirstName,
          last_name: clientLastName,
          legal_structure: clientLegalStructure,
          fein: clientFein,
          address: clientAddress,
          contact: clientContact
        }, { onConflict: 'agency_id,name', ignoreDuplicates: false });
    }

    // Upload attachments if present
    const attachments: string[] = []
    
    // Example of finding files in FormData
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'object' && value !== null && 'name' in value && 'size' in value) {
        const fileExt = (value as File).name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${profile.agency_id}/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('quote-attachments')
          .upload(filePath, value as File)
          
        if (!uploadError) {
          attachments.push(filePath)
          // Store path in rawFormData so UI knows this field has a file
          rawFormData[key] = filePath
        } else {
          console.error("Upload error:", uploadError)
        }
      }
    }

    const { error } = await supabase.from("quote_requests").insert({
      agent_id: user.id,
      agency_id: profile.agency_id,
      client_name: clientName,
      client_business_type: rawFormData.general_legal_structure || null,
      carrier_id: carrierId,
      coverage_requested: products.join(", "),
      products: products,
      form_data: rawFormData,
      status: "PENDING_MANAGER"
    })

    if (error) {
      console.error("Error submitting quote:", error)
      return { success: false, error: error.message || "Failed to submit quote" }
    }
    
    // Notify managers
    const { data: managers } = await supabase
      .from("profiles")
      .select("id")
      .eq("agency_id", profile.agency_id)
      .in("role", ["MANAGER", "ADMIN"])
      
    if (managers && managers.length > 0) {
      const notifications = managers.map(m => ({
        user_id: m.id,
        title: "Nueva Solicitud de Cotización",
        message: `El agente ha solicitado una cotización para ${clientName}.`,
        type: "new_quote",
        link: "/quotes"
      }))
      await supabase.from("notifications").insert(notifications)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error in submitQuoteRequest:", error)
    return { success: false, error: error?.message || String(error) }
  }
}

export async function processMultipleQuotes(
  quoteId: string, 
  quotes: { 
    product: string, 
    carrier: string,
    premium: number, 
    commission_percentage: number, 
    file_url?: string,
    monthly_payment?: number,
    downpayment?: number,
    payment_options?: string,
    is_bundled?: boolean,
    coverages?: string,
    included?: string,
    excluded?: string,
    notes?: string
  }[]
) {
  const supabase = await createClient()
  
  const totalPremium = quotes.reduce((sum, q) => sum + (Number(q.premium) || 0), 0)

  const { error } = await supabase
    .from("quote_requests")
    .update({
      premium_amount: totalPremium,
      quotes_provided: quotes,
      status: "QUOTED"
    })
    .eq("id", quoteId)

  if (error) {
    console.error("Error updating quote:", error)
    throw new Error("Failed to update quote")
  }

  revalidatePath("/quotes")
  revalidatePath("/")
  return { success: true }
}

export async function assignQuoteRequest(quoteId: string, assigneeId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || (profile.role !== "MANAGER" && profile.role !== "ADMIN")) {
    return { success: false, error: "Only managers and admins can assign quotes." }
  }

  const { error } = await supabase
    .from("quote_requests")
    .update({ assigned_to: assigneeId })
    .eq("id", quoteId)

  if (error) {
    console.error("Error assigning quote:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/quotes")
  revalidatePath("/")
  return { success: true }
}

export async function updateQuoteStatus(quoteId: string, status: string, soldPremium?: number, commissionPercentage?: number, selectedQuotes?: boolean[]) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !['MANAGER', 'ADMIN', 'AGENT'].includes(profile.role)) {
    return { success: false, error: "Unauthorized role." }
  }

  const updates: any = { status }
  if (soldPremium !== undefined && !isNaN(soldPremium)) updates.sold_premium = soldPremium
  if (commissionPercentage !== undefined && !isNaN(commissionPercentage)) updates.commission_percentage = commissionPercentage
  if (status === 'ACCEPTED') {
    updates.accepted_at = new Date().toISOString()
  }
  
  if (selectedQuotes && selectedQuotes.length > 0) {
    const { data: quote } = await supabase.from("quote_requests").select("quotes_provided").eq("id", quoteId).single()
    let updatedQuotesProvided = quote?.quotes_provided || []
    if (Array.isArray(updatedQuotesProvided)) {
      updatedQuotesProvided = updatedQuotesProvided.map((prop: any, index: number) => ({
        ...prop,
        accepted: selectedQuotes[index] || false
      }))
      updates.quotes_provided = updatedQuotesProvided
    }
  }

  const { error } = await supabase
    .from("quote_requests")
    .update(updates)
    .eq("id", quoteId)

  if (error) {
    console.error("Error updating quote status:", error)
    return { success: false, error: error.message }
  }

  // Notify agent
  const { data: quote } = await supabase.from("quote_requests").select("agent_id, client_name").eq("id", quoteId).single()
  if (quote && quote.agent_id !== user.id) {
    await supabase.from("notifications").insert({
      user_id: quote.agent_id,
      title: "Actualización de Cotización",
      message: `El estado de la cotización de ${quote.client_name} cambió a ${status}.`,
      type: "quote_update",
      link: "/quotes"
    })
  }

  revalidatePath("/quotes")
  revalidatePath("/")
  return { success: true }
}

export async function acceptClientQuote(quoteId: string, soldPremium: number, selectedModules: boolean[]) {
  const supabase = await createClient()
  
  // Fetch current quote to update quotes_provided JSON
  const { data: quote } = await supabase.from("quote_requests").select("quotes_provided").eq("id", quoteId).single()
  
  let updatedQuotesProvided = quote?.quotes_provided || []
  if (Array.isArray(updatedQuotesProvided)) {
    updatedQuotesProvided = updatedQuotesProvided.map((prop: any, index: number) => ({
      ...prop,
      accepted: selectedModules[index] || false
    }))
  }

  const updates: any = { 
    status: 'ACCEPTED',
    sold_premium: soldPremium,
    accepted_at: new Date().toISOString(),
    quotes_provided: updatedQuotesProvided
  }

  const { error } = await supabase
    .from("quote_requests")
    .update(updates)
    .eq("id", quoteId)

  if (error) {
    console.error("Error updating quote status:", error)
    return { success: false, error: error.message }
  }

  // Notify agent if needed
  const { data: { user } } = await supabase.auth.getUser()
  const { data: quoteRequest } = await supabase.from("quote_requests").select("agent_id, client_name").eq("id", quoteId).single()
  if (user && quoteRequest && quoteRequest.agent_id !== user.id) {
    await supabase.from("notifications").insert({
      user_id: quoteRequest.agent_id,
      title: "Cotización Aceptada",
      message: `El cliente ${quoteRequest.client_name} ha aceptado la cotización.`,
      type: "quote_accepted",
      link: "/quotes"
    })
  }

  revalidatePath("/quotes")
  revalidatePath("/")
  return { success: true }
}

export async function updateQuoteRequestData(quoteId: string, formData: any) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: quote } = await supabase.from("quote_requests").select("agent_id").eq("id", quoteId).single()
  
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  
  if (!quote || (quote.agent_id !== user.id && profile?.role !== 'ADMIN' && profile?.role !== 'MANAGER')) {
    return { success: false, error: "Unauthorized to edit this quote" }
  }

  const { error } = await supabase
    .from("quote_requests")
    .update({ form_data: formData })
    .eq("id", quoteId)

  if (error) {
    console.error("Error updating quote form data:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/quotes")
  return { success: true }
}

export async function transferQuoteOwnership(quoteId: string, newOwnerId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || (profile.role !== "MANAGER" && profile.role !== "ADMIN")) {
    return { success: false, error: "Only managers and admins can transfer property." }
  }

  const { error } = await supabase
    .from("quote_requests")
    .update({ agent_id: newOwnerId })
    .eq("id", quoteId)

  if (error) {
    console.error("Error transferring property:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/quotes")
  revalidatePath("/")
  return { success: true }
}

export async function duplicateQuoteRequest(quoteId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  // 1. Fetch original quote
  const { data: quote, error: fetchError } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("id", quoteId)
    .single()

  if (fetchError || !quote) {
    return { success: false, error: "Original quote not found." }
  }

  // 2. Insert new duplicated quote
  const { error: insertError } = await supabase.from("quote_requests").insert({
    agent_id: quote.agent_id,
    agency_id: quote.agency_id,
    client_name: quote.client_name,
    client_business_type: quote.client_business_type,
    carrier_id: quote.carrier_id,
    coverage_requested: quote.coverage_requested,
    products: quote.products,
    form_data: quote.form_data,
    status: "PENDING_MANAGER"
  })

  if (insertError) {
    console.error("Error duplicating quote:", insertError)
    return { success: false, error: insertError.message }
  }

  // 3. Notify managers
  const { data: managers } = await supabase
    .from("profiles")
    .select("id")
    .eq("agency_id", quote.agency_id)
    .in("role", ["MANAGER", "ADMIN"])
    
  if (managers && managers.length > 0) {
    const notifications = managers.map(m => ({
      user_id: m.id,
      title: "Solicitud Duplicada",
      message: `El agente ha duplicado una solicitud para ${quote.client_name}.`,
      type: "new_quote",
      link: "/quotes"
    }))
    await supabase.from("notifications").insert(notifications)
  }

  revalidatePath("/quotes")
  revalidatePath("/")
  return { success: true }
}
