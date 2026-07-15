"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function uploadAppetiteMatrix(jsonData: string) {
  // First, verify the user is an ADMIN
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) {
    return { success: false, error: "No autorizado (No autenticado)" }
  }

  const { data: profile } = await userClient.from('profiles').select('role').eq('id', user.id).single()
  
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: "Acceso denegado: Se requiere rol de ADMIN" }
  }

  // We will use the authenticated userClient directly. 
  // Make sure RLS policies in Supabase allow INSERT for authenticated users, 
  // or disable RLS on appetite_matrix table for this to work.
  const supabase = userClient;

  try {
    const payload = JSON.parse(jsonData)
    const records = Array.isArray(payload) ? payload : [payload]
    
    const rowsToInsert: any[] = []

    for (const carrier of records) {
      const { carrier_name, product_line, language, eligible_classes, prohibited_classes, general_prohibited_operations } = carrier
      
      // Process Eligible
      if (Array.isArray(eligible_classes)) {
        for (const ec of eligible_classes) {
          rowsToInsert.push({
            carrier_name,
            product_line,
            language: language || 'es',
            industry_name: ec.industry_name,
            naics_code: ec.naics_code || null,
            status: 'ELIGIBLE',
            conditions: ec.conditions || null,
            min_premium: ec.min_premium || null,
            max_limits: ec.max_limits || null,
            general_prohibited_operations: general_prohibited_operations || []
          })
        }
      }

      // Process Prohibited
      if (Array.isArray(prohibited_classes)) {
        for (const pc of prohibited_classes) {
          rowsToInsert.push({
            carrier_name,
            product_line,
            language: language || 'es',
            industry_name: pc.industry_name,
            naics_code: pc.naics_code || null,
            status: 'PROHIBITED',
            conditions: pc.reason || null, // store reason in conditions
            min_premium: null,
            max_limits: null,
            general_prohibited_operations: general_prohibited_operations || []
          })
        }
      }
    }

    if (rowsToInsert.length === 0) {
      throw new Error("No valid data found to insert")
    }

    // ---------------------------------------------------------
    // Lógica de Upsert Manual: Eliminar duplicados existentes 
    // antes de insertar los nuevos para la misma combinación 
    // Aseguradora + Producto + Industria
    // ---------------------------------------------------------
    for (const carrier of records) {
      const carrier_name = carrier.carrier_name
      const product_line = carrier.product_line
      const industries: string[] = []
      
      if (Array.isArray(carrier.eligible_classes)) {
        industries.push(...carrier.eligible_classes.map((c: any) => c.industry_name).filter(Boolean))
      }
      if (Array.isArray(carrier.prohibited_classes)) {
        industries.push(...carrier.prohibited_classes.map((c: any) => c.industry_name).filter(Boolean))
      }
      
      if (industries.length > 0 && carrier_name && product_line) {
        // Ejecutamos el delete preventivo
        const { error: deleteError } = await supabase
          .from('appetite_matrix')
          .delete()
          .eq('carrier_name', carrier_name)
          .eq('product_line', product_line)
          .in('industry_name', industries)
          
        if (deleteError) {
          console.error(`Error borrando registros antiguos para upsert (${carrier_name}):`, deleteError)
          // No detenemos el flujo, intentamos la inserción de todos modos (aunque duplicará si falló el delete)
        }
      }
    }

    const { error } = await supabase.from('appetite_matrix').insert(rowsToInsert)
    if (error) throw error

    revalidatePath("/appetite")
    return { success: true, count: rowsToInsert.length }
    
  } catch (error: any) {
    console.error("Upload error:", error)
    return { success: false, error: error.message }
  }
}

export async function getAppetiteMatrix(filters: { productLine?: string, industry?: string } = {}) {
  const supabase = await createClient()
  
  let query = supabase.from('appetite_matrix').select('*')
  
  if (filters.productLine) {
    query = query.ilike('product_line', `%${filters.productLine}%`)
  }
  if (filters.industry) {
    query = query.ilike('industry_name', `%${filters.industry}%`)
  }
  
  const { data, error } = await query
  if (error) {
    console.error("Error fetching matrix:", error)
    return []
  }
  
  // Clean up bad literal translations
  if (data) {
    return data.map(row => ({
      ...row,
      industry_name: row.industry_name 
        ? row.industry_name.replace(/Erecci[óo]n/g, 'Montaje Estructural').replace(/erecci[óo]n/g, 'montaje estructural') 
        : row.industry_name,
      conditions: row.conditions 
        ? row.conditions.replace(/Erecci[óo]n/g, 'Montaje Estructural').replace(/erecci[óo]n/g, 'montaje estructural') 
        : row.conditions,
    }))
  }
  
  return data
}
