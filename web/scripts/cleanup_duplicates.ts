import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
  process.exit(1)
}

const supabase = createClient(url, key)

async function run() {
  console.log("Fetching all records from appetite_matrix...")
  const { data, error } = await supabase.from('appetite_matrix').select('*')
  
  if (error) {
    console.error("Error fetching data:", error)
    return
  }
  
  if (!data || data.length === 0) {
    console.log("No data found.")
    return
  }
  
  console.log(`Found ${data.length} total records.`)
  
  // Group by unique key
  const grouped = new Map<string, any[]>()
  for (const row of data) {
    const key = `${row.carrier_name}||${row.product_line}||${row.industry_name}`
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(row)
  }
  
  const toDelete: string[] = []
  
  for (const [key, rows] of grouped.entries()) {
    if (rows.length > 1) {
      // Sort by created_at DESC to keep the newest
      rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      const [newest, ...rest] = rows
      console.log(`Duplicate found for: ${key.replace(/\|\|/g, ' - ')}. Keeping ID: ${newest.id}. Deleting ${rest.length} older records.`)
      
      toDelete.push(...rest.map(r => r.id))
    }
  }
  
  if (toDelete.length === 0) {
    console.log("No duplicates found. Database is clean!")
    return
  }
  
  console.log(`\nDeleting ${toDelete.length} duplicate records...`)
  
  // Supabase delete by IN array (batch it if it's too large, but shouldn't be huge for now)
  const chunkSize = 100
  let deletedCount = 0
  for (let i = 0; i < toDelete.length; i += chunkSize) {
    const chunk = toDelete.slice(i, i + chunkSize)
    const { error: delError } = await supabase.from('appetite_matrix').delete().in('id', chunk)
    if (delError) {
      console.error("Failed to delete chunk:", delError)
    } else {
      deletedCount += chunk.length
    }
  }
  
  console.log(`Successfully deleted ${deletedCount} duplicate records.`)
}

run().catch(console.error)
