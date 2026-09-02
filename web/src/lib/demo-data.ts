export const demoClients = [
  { id: 'demo-client-1', name: 'Juan Perez', first_name: 'Juan', last_name: 'Perez', legal_structure: 'Personal', fein: '123456789', address: '123 Fake St, Miami, FL', contact: 'juan.perez@demo.com', status: 'CLIENTE', created_at: new Date().toISOString() },
  { id: 'demo-client-2', name: 'Maria Garcia', first_name: 'Maria', last_name: 'Garcia', legal_structure: 'Personal', fein: '987654321', address: '456 Main St, Orlando, FL', contact: 'maria.garcia@demo.com', status: 'SEGUIMIENTO', created_at: new Date().toISOString() },
  { id: 'demo-client-3', name: 'Tech Solutions LLC', legal_structure: 'Commercial', fein: '112233445', address: '789 Business Blvd, Tampa, FL', contact: 'info@techsolutions.demo', status: 'CLIENTE', created_at: new Date().toISOString() }
]

export const demoQuotes = [
  { id: 'demo-quote-1', agent_id: 'demo-agent-1', agency_id: 'demo-agency-1', client_name: 'Juan Perez', client_business_type: 'Personal', carrier_id: 'Progressive', coverage_requested: 'Auto', premium_amount: 1200.00, sold_premium: 1200.00, commission_amount: 120.00, commission_percentage: 10, status: 'ACCEPTED', created_at: new Date().toISOString(), quotes_provided: [{carrier: 'Progressive', premium: 1200, commission_percentage: 10}] },
  { id: 'demo-quote-2', agent_id: 'demo-agent-1', agency_id: 'demo-agency-1', client_name: 'Tech Solutions LLC', client_business_type: 'Commercial', carrier_id: 'Travelers', coverage_requested: 'General Liability', premium_amount: 4500.00, sold_premium: 4500.00, commission_amount: 450.00, commission_percentage: 10, status: 'ACCEPTED', created_at: new Date().toISOString(), quotes_provided: [{carrier: 'Travelers', premium: 4500, commission_percentage: 10}] },
  { id: 'demo-quote-3', agent_id: 'demo-agent-1', agency_id: 'demo-agency-1', client_name: 'Maria Garcia', client_business_type: 'Personal', carrier_id: 'State Farm', coverage_requested: 'Homeowners', premium_amount: 2500.00, commission_amount: 250.00, commission_percentage: 10, status: 'SUBMITTED_TO_CARRIER', created_at: new Date().toISOString() }
]

export const demoPolicies = [
  { id: 'demo-pol-1', policy_number: 'POL-DEMO-001', year: 2026, month: 8, insurance_type: 'Personal', carrier_id: 'Progressive', coverage: 'Auto', state: 'FL', city: 'Miami', zip_code: '33101', premium_amount: 1200.00, agency_commission_percentage: 10, agency_commission_amount: 120.00, client_first_name: 'Juan', client_last_name: 'Perez', client_company_name: null, created_at: new Date().toISOString() },
  { id: 'demo-pol-2', policy_number: 'POL-DEMO-002', year: 2026, month: 9, insurance_type: 'Commercial', carrier_id: 'Travelers', coverage: 'General Liability', state: 'FL', city: 'Tampa', zip_code: '33602', premium_amount: 4500.00, agency_commission_percentage: 10, agency_commission_amount: 450.00, client_first_name: null, client_last_name: null, client_company_name: 'Tech Solutions LLC', created_at: new Date().toISOString() }
]

export const demoVisits = [
  { id: 'demo-visit-1', visit_date: new Date().toISOString(), conversation_notes: 'Cierre de póliza auto exitoso.', client: {name: 'Juan Perez'} },
  { id: 'demo-visit-2', visit_date: new Date().toISOString(), conversation_notes: 'Presentamos cotización.', client: {name: 'Maria Garcia'} }
]


export const demoTasks = [
  { id: 'demo-task-1', note: 'Llamar a Maria para seguimiento de Homeowners', due_date: new Date(Date.now() + 86400000).toISOString(), status: 'PENDING', client: {name: 'Maria Garcia'} },
  { id: 'demo-task-2', note: 'Revisar renovación Liability 2027', due_date: new Date(Date.now() + 86400000 * 180).toISOString(), status: 'PENDING', client: {name: 'Tech Solutions LLC'} }
]


export const demoAgencyData = {
  agencyId: 'demo-agency-1',
  agencyName: 'Demo Agency',
  agencyLogo: null,
  agents: [
    {
      id: 'demo-agent-1',
      name: 'Agent Demo',
      email: 'agent@demo.com',
      role: 'AGENT',
      commission_rate: 10,
      stats: { totalQuotes: 3, boundQuotes: 2, totalPremium: 5700.00, totalCommission: 570.00 }
    }
  ]
}
