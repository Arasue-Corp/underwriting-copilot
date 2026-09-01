import os

path = 'web/src/app/actions/quote.ts'
c = open(path, 'r', encoding='utf-8').read()

func = '''
async function autoCreatePolicies(quoteId: string, supabase: any) {
  const { data: quote } = await supabase.from('quote_requests').select('*').eq('id', quoteId).single()
  if (!quote) return

  const { data: existingPolicies } = await supabase.from('policies').select('id').eq('quote_id', quoteId)
  if (existingPolicies && existingPolicies.length > 0) return

  if (Array.isArray(quote.quotes_provided)) {
    const acceptedQuotes = quote.quotes_provided.filter((q: any) => q.accepted)
    const policiesToInsert = []
    
    for (const aq of acceptedQuotes) {
      let clientFirstName = quote.form_data?.general_first_name || ''
      let clientLastName = quote.form_data?.general_last_name || ''
      let clientCompanyName = quote.form_data?.general_company_name || quote.form_data?.general_legal_name || ''

      policiesToInsert.push({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        insurance_type: quote.form_data?.general_quote_category === 'personal' ? 'Personal' : 'Comercial',
        carrier_id: aq.carrier || '',
        coverage: aq.product || quote.coverage_requested,
        state: quote.form_data?.general_state || '',
        city: quote.form_data?.general_city || '',
        zip_code: quote.form_data?.general_zip_code || '',
        agent_id: quote.agent_id,
        premium_amount: aq.premium || 0,
        agency_commission_percentage: aq.commission_percentage || 0,
        agency_commission_amount: (aq.premium || 0) * ((aq.commission_percentage || 0) / 100),
        client_first_name: clientFirstName,
        client_last_name: clientLastName,
        client_company_name: clientCompanyName,
        quote_id: quote.id,
        agency_id: quote.agency_id
      })
    }

    if (policiesToInsert.length > 0) {
      await supabase.from('policies').insert(policiesToInsert)
    }
  }
}
'''

if 'autoCreatePolicies' not in c:
    c = c + '\n' + func

c = c.replace(
'''    if (error) {
      console.error("Error updating quote status:", error)
      return { success: false, error: error.message }
    }
  
    // Notify agent if needed''',
'''    if (error) {
      console.error("Error updating quote status:", error)
      return { success: false, error: error.message }
    }
  
    if (status === 'ACCEPTED') {
      await autoCreatePolicies(quoteId, supabase)
    }

    // Notify agent if needed'''
)

c = c.replace(
'''    const { error } = await supabase
      .from("quote_requests")
      .update(updates)
      .eq("id", quoteId)
  
    if (error) {
      console.error("Error updating quote status:", error)
      return { success: false, error: error.message }
    }
  
    // Notify agent if needed
    const { data: { user } } = await supabase.auth.getUser()''',
'''    const { error } = await supabase
      .from("quote_requests")
      .update(updates)
      .eq("id", quoteId)
  
    if (error) {
      console.error("Error updating quote status:", error)
      return { success: false, error: error.message }
    }
    
    await autoCreatePolicies(quoteId, supabase)
  
    // Notify agent if needed
    const { data: { user } } = await supabase.auth.getUser()'''
)

open(path, 'w', encoding='utf-8').write(c)
print('Done!')
