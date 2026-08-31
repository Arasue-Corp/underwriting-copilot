"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Create a new visit / task
export async function createVisit(data: any) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autenticado")

    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!profile) throw new Error("Perfil no encontrado")

    let clientId = data.client_id
    const clientStatus = data.client_status || 'SEGUIMIENTO'

    // Si viene información de un nuevo cliente, lo creamos primero
    if (!clientId && data.new_client_name) {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          agency_id: profile.agency_id,
          name: data.new_client_name,
          address: data.new_client_address || null,
          contact: data.new_client_contact || null,
          status: clientStatus
        })
        .select('id')
        .single()

      if (clientError) throw new Error("Error al crear el nuevo cliente: " + clientError.message)
      clientId = newClient.id
    }

    if (!clientId) throw new Error("Se requiere un cliente para registrar la visita")

    // Actualizar el estado si es cliente existente
    if (data.client_id && clientStatus) {
      await supabase.from('clients').update({ status: clientStatus }).eq('id', data.client_id)
    }

    // Eliminar los campos extra antes de insertar en visits
    const { new_client_name, new_client_address, new_client_contact, client_status, ...visitData } = data

    const { error } = await supabase.from('visits').insert({
      ...visitData,
      client_id: clientId,
      created_by: user.id,
      agency_id: profile.agency_id
    })

    if (error) throw error

    revalidatePath('/visits')
    revalidatePath('/clients')
    if (clientId) revalidatePath(`/clients/${clientId}`)
    
    return { success: true }
  } catch (error: any) {
    console.error("Error creating visit:", error)
    return { success: false, error: error.message }
  }
}

// Update a visit (status, assignation, notes)
export async function updateVisit(id: string, data: any) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autenticado")

    const { error } = await supabase
      .from('visits')
      .update(data)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/visits')
    revalidatePath('/clients')
    return { success: true }
  } catch (error: any) {
    console.error("Error updating visit:", error)
    return { success: false, error: error.message }
  }
}

export async function getVisits(filters?: { startDate?: string, endDate?: string, agencyId?: string, agentId?: string | string[] }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, agency_id')
      .eq('id', user.id)
      .single()

    if (!profile) return []

    let query = supabase
      .from('visits')
      .select(`
        *,
        client:clients(name, address, logo_url),
        assignee:profiles!visits_assigned_to_fkey(name, email),
        creator:profiles!visits_created_by_fkey(name, email)
      `)
      .order('created_at', { ascending: false })

    if (profile.role === 'AGENT') {
      // Agents see what they created or what is assigned to them
      query = query.or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
    } else if (profile.role === 'MANAGER') {
      // Managers see everything in their agency (unless filtered further)
      if (filters?.agencyId) {
        query = query.eq('agency_id', filters.agencyId)
      } else {
        query = query.eq('agency_id', profile.agency_id)
      }
    } else if (profile.role === 'ADMIN') {
      if (filters?.agencyId) {
        query = query.eq('agency_id', filters.agencyId)
      }
    }
    
    // Additional filters
    if (filters?.startDate) {
      query = query.gte('created_at', `${filters.startDate}T00:00:00.000Z`)
    }
    if (filters?.endDate) {
      query = query.lte('created_at', `${filters.endDate}T23:59:59.999Z`)
    }
    if (filters?.agentId) {
      if (Array.isArray(filters.agentId)) {
        query = query.in('assigned_to', filters.agentId)
      } else {
        query = query.eq('assigned_to', filters.agentId)
      }
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting visits:", error)
    return []
  }
}

export async function getAgencyAgents() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!profile) return []

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role')
      .eq('agency_id', profile.agency_id)
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting agents:", error)
    return []
  }
}
