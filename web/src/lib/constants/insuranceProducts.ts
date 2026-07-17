export type FieldType = 'text' | 'number' | 'textarea' | 'file' | 'select' | 'boolean';

export interface ProductField {
  id: string;
  label: string; // Spanish
  labelEn: string; // English
  type: FieldType;
  options?: string[]; // Spanish options
  optionsEn?: string[]; // English options
  required?: boolean;
}

export interface InsuranceProduct {
  id: string;
  name: string; // Spanish
  nameEn: string; // English
  description: string; // Spanish
  descriptionEn: string; // English
  fields: ProductField[];
}

export const INSURANCE_PRODUCTS: InsuranceProduct[] = [
  {
    id: 'general_liability',
    name: 'Responsabilidad Civil General (GL)',
    nameEn: 'General Liability (GL)',
    description: 'Protege al negocio contra reclamos por lesiones corporales a terceros, daños a la propiedad ajena, etc.',
    descriptionEn: 'Protects the business against claims for third-party bodily injury, property damage, etc.',
    fields: [
      { id: 'gl_gross_revenues', label: 'Ingresos Brutos Anuales', labelEn: 'Annual Gross Revenues', type: 'text' },
      { id: 'gl_payroll', label: 'Nómina Total (Desglosada)', labelEn: 'Total Payroll (Itemized)', type: 'textarea' },
      { id: 'gl_subcontractors_cost', label: 'Costos de Subcontratistas', labelEn: 'Subcontractor Costs', type: 'number' },
      { id: 'gl_square_footage', label: 'Pies Cuadrados (Área comercial)', labelEn: 'Square Footage (Commercial Area)', type: 'number' },
      { id: 'gl_owners_count', label: 'Número de Dueños/Socios', labelEn: 'Number of Owners/Partners', type: 'number' },
      { id: 'gl_employees_count', label: 'Número de Empleados', labelEn: 'Number of Employees', type: 'number' },
    ]
  },
  {
    id: 'bop',
    name: 'Business Owner\'s Policy (BOP)',
    nameEn: 'Business Owner\'s Policy (BOP)',
    description: 'Paquete que combina General Liability y Commercial Property.',
    descriptionEn: 'Package policy combining General Liability and Commercial Property.',
    fields: [
      { id: 'bop_gross_revenues', label: 'Ingresos Brutos Anuales', labelEn: 'Annual Gross Revenues', type: 'text' },
      { id: 'bop_payroll', label: 'Nómina Total', labelEn: 'Total Payroll', type: 'text' },
      { id: 'bop_building_value', label: 'Valor del Edificio (Costo de reemplazo)', labelEn: 'Building Value (Replacement Cost)', type: 'number' },
      { id: 'bop_bpp_value', label: 'Valor de Bienes Personales (BPP)', labelEn: 'Business Personal Property Value (BPP)', type: 'number' },
      { id: 'bop_building_characteristics', label: 'Características del Edificio', labelEn: 'Building Characteristics', type: 'textarea' },
      { id: 'bop_business_interruption', label: 'Límites de Interrupción de Negocio', labelEn: 'Business Interruption Limits', type: 'number' },
    ]
  },
  {
    id: 'commercial_property',
    name: 'Propiedad Comercial (Commercial Property)',
    nameEn: 'Commercial Property',
    description: 'Asegura los bienes inmuebles y muebles contra riesgos.',
    descriptionEn: 'Insures real and personal property against risks.',
    fields: [
      { id: 'cp_construction', label: 'Construcción (Materiales y Año)', labelEn: 'Construction (Materials and Year)', type: 'text' },
      { id: 'cp_occupancy', label: 'Ocupación (Inquilinos y actividades)', labelEn: 'Occupancy (Tenants and activities)', type: 'textarea' },
      { id: 'cp_protection', label: 'Protección (Alarmas, Sprinklers, Distancia a bomberos)', labelEn: 'Protection (Alarms, Sprinklers, Fire Dept Distance)', type: 'textarea' },
      { id: 'cp_exposure', label: 'Exposición (Negocios colindantes)', labelEn: 'Exposure (Adjacent businesses)', type: 'textarea' },
      { id: 'cp_updates', label: 'Actualizaciones Mayores (Techo, plomería, HVAC, año)', labelEn: 'Major Updates (Roof, plumbing, HVAC, year)', type: 'textarea' },
      { id: 'cp_replacement_value', label: 'Valor de Reemplazo (Edificio)', labelEn: 'Replacement Value (Building)', type: 'number' },
      { id: 'cp_bpp_value', label: 'Valor de BPP', labelEn: 'BPP Value', type: 'number' },
    ]
  },
  {
    id: 'workers_comp',
    name: 'Indemnización Laboral (Workers\' Comp)',
    nameEn: 'Workers\' Compensation',
    description: 'Cubre gastos médicos y salarios perdidos para empleados lesionados.',
    descriptionEn: 'Covers medical expenses and lost wages for injured employees.',
    fields: [
      { id: 'wc_payroll_by_class', label: 'Nómina Estimada por Código de Clase', labelEn: 'Estimated Payroll by Class Code', type: 'textarea' },
      { id: 'wc_employees_by_class', label: 'Número de Empleados por Clase', labelEn: 'Number of Employees by Class', type: 'textarea' },
      { id: 'wc_fein', label: 'FEIN', labelEn: 'FEIN', type: 'text' },
      { id: 'wc_safety_programs', label: 'Programas de Seguridad Existentes', labelEn: 'Existing Safety Programs', type: 'textarea' },
      { id: 'wc_mod_sheet', label: 'Experience Modification Rating (Mod Sheet)', labelEn: 'Experience Modification Rating (Mod Sheet)', type: 'file' },
    ]
  },
  {
    id: 'commercial_auto',
    name: 'Auto Comercial',
    nameEn: 'Commercial Auto',
    description: 'Protege los vehículos utilizados para fines comerciales.',
    descriptionEn: 'Protects vehicles used for commercial purposes.',
    fields: [
      { id: 'ca_vehicle_schedule', label: 'Lista de Vehículos (VIN, Año, Marca, Modelo, GVW)', labelEn: 'Vehicle Schedule (VIN, Year, Make, Model, GVW)', type: 'textarea' },
      { id: 'ca_driver_schedule', label: 'Lista de Conductores (Nombre, Fecha Nac., Licencia, Estado)', labelEn: 'Driver Schedule (Name, DOB, License, State)', type: 'textarea' },
      { id: 'ca_mvr', label: 'MVRs (Historial de manejo)', labelEn: 'MVRs (Motor Vehicle Records)', type: 'file' },
      { id: 'ca_radius', label: 'Radio de Operación (Millas)', labelEn: 'Radius of Operation (Miles)', type: 'number' },
      { id: 'ca_usage', label: 'Uso de Vehículos (Servicio, Retail, Comercial)', labelEn: 'Vehicle Usage (Service, Retail, Commercial)', type: 'textarea' },
    ]
  },
  {
    id: 'errors_omissions',
    name: 'Errores y Omisiones (E&O) / Professional Liability',
    nameEn: 'Errors & Omissions (E&O) / Professional Liability',
    description: 'Protege contra demandas por negligencia en servicios profesionales.',
    descriptionEn: 'Protects against negligence claims in professional services.',
    fields: [
      { id: 'eo_services', label: 'Descripción de Servicios Profesionales', labelEn: 'Description of Professional Services', type: 'textarea' },
      { id: 'eo_revenues', label: 'Ingresos Históricos y Proyectados', labelEn: 'Historical and Projected Revenues', type: 'textarea' },
      { id: 'eo_contracts', label: 'Copia de Contratos Tipo', labelEn: 'Sample Contracts', type: 'file' },
      { id: 'eo_subcontractors', label: 'Uso de Subcontratistas Indep.', labelEn: 'Use of Independent Subcontractors', type: 'boolean' },
      { id: 'eo_resume', label: 'Resumen/CV de Principales Profesionales', labelEn: 'Resumes/CVs of Key Professionals', type: 'file' },
    ]
  },
  {
    id: 'cyber_liability',
    name: 'Responsabilidad Cibernética (Cyber Liability)',
    nameEn: 'Cyber Liability',
    description: 'Protege contra brechas de datos y ciberataques.',
    descriptionEn: 'Protects against data breaches and cyberattacks.',
    fields: [
      { id: 'cyber_records', label: 'Número de Registros de Datos (PII, PHI, PCI)', labelEn: 'Number of Data Records (PII, PHI, PCI)', type: 'number' },
      { id: 'cyber_revenues', label: 'Ingresos Anuales', labelEn: 'Annual Revenues', type: 'text' },
      { id: 'cyber_security', label: 'Medidas de Seguridad (MFA, Backups, Encriptación)', labelEn: 'Security Measures (MFA, Backups, Encryption)', type: 'textarea' },
      { id: 'cyber_pci', label: 'Cumplimiento PCI (Si procesa tarjetas)', labelEn: 'PCI Compliance (If processing cards)', type: 'boolean' },
    ]
  },
  {
    id: 'directors_officers',
    name: 'Directores y Oficiales (D&O)',
    nameEn: 'Directors and Officers (D&O)',
    description: 'Asegura a los directores contra demandas por decisiones de gestión.',
    descriptionEn: 'Insures directors against lawsuits for management decisions.',
    fields: [
      { id: 'do_financials', label: 'Estados Financieros Auditados (Últimos 2 años)', labelEn: 'Audited Financial Statements (Last 2 years)', type: 'file' },
      { id: 'do_ownership', label: 'Estructura de Propiedad (Cap Table)', labelEn: 'Ownership Structure (Cap Table)', type: 'textarea' },
      { id: 'do_funding', label: 'Historial de Financiación (Rondas)', labelEn: 'Funding History (Rounds)', type: 'textarea' },
      { id: 'do_bylaws', label: 'Estatutos Corporativos', labelEn: 'Corporate Bylaws', type: 'file' },
    ]
  },
  {
    id: 'epli',
    name: 'Prácticas de Empleo (EPLI)',
    nameEn: 'Employment Practices Liability (EPLI)',
    description: 'Cubre demandas por discriminación, acoso, o despido injustificado.',
    descriptionEn: 'Covers claims for discrimination, harassment, or wrongful termination.',
    fields: [
      { id: 'epli_employees', label: 'Conteo de Empleados (Full-time, Part-time, Temp)', labelEn: 'Employee Count (FT, PT, Temp)', type: 'textarea' },
      { id: 'epli_turnover', label: 'Tasa de Rotación Histórica', labelEn: 'Historical Turnover Rate', type: 'text' },
      { id: 'epli_manual', label: 'Manual de Empleado Existente?', labelEn: 'Existing Employee Manual?', type: 'boolean' },
      { id: 'epli_hr', label: 'Departamento de RRHH dedicado?', labelEn: 'Dedicated HR Department?', type: 'boolean' },
      { id: 'epli_layoffs', label: 'Despidos Masivos Planeados?', labelEn: 'Planned Mass Layoffs?', type: 'boolean' },
    ]
  },
  {
    id: 'inland_marine',
    name: 'Inland Marine (Equipo Móvil/Tránsito)',
    nameEn: 'Inland Marine (Mobile Equipment/Transit)',
    description: 'Asegura equipos y herramientas que se mueven de un lugar a otro.',
    descriptionEn: 'Insures equipment and tools that move from one location to another.',
    fields: [
      { id: 'im_equipment', label: 'Lista de Equipos (Descripción, Valor, Número de Serie)', labelEn: 'Equipment Schedule (Description, Value, Serial Number)', type: 'textarea' },
      { id: 'im_max_value', label: 'Valor Máximo por Artículo', labelEn: 'Maximum Value per Item', type: 'number' },
      { id: 'im_transit_value', label: 'Valor en Tránsito', labelEn: 'Value in Transit', type: 'number' },
      { id: 'im_security', label: 'Medidas de Seguridad (GPS, Almacenaje)', labelEn: 'Security Measures (GPS, Storage)', type: 'textarea' },
    ]
  },
  {
    id: 'umbrella',
    name: 'Umbrella / Excess Liability',
    nameEn: 'Umbrella / Excess Liability',
    description: 'Proporciona límites adicionales por encima de las pólizas primarias.',
    descriptionEn: 'Provides additional limits above primary policies.',
    fields: [
      { id: 'umb_underlying', label: 'Detalles de Pólizas Subyacentes (GL, Auto, WC)', labelEn: 'Underlying Policy Details (GL, Auto, WC)', type: 'textarea' },
      { id: 'umb_limits', label: 'Límites Subyacentes Actuales', labelEn: 'Current Underlying Limits', type: 'textarea' },
      { id: 'umb_requested', label: 'Límite Umbrella Solicitado', labelEn: 'Requested Umbrella Limit', type: 'number' },
    ]
  },
  {
    id: 'builders_risk',
    name: 'Riesgo de Constructor (Builder\'s Risk)',
    nameEn: 'Builder\'s Risk',
    description: 'Asegura edificios en construcción.',
    descriptionEn: 'Insures buildings under construction.',
    fields: [
      { id: 'br_project', label: 'Descripción del Proyecto', labelEn: 'Project Description', type: 'textarea' },
      { id: 'br_value', label: 'Valor Total Terminado', labelEn: 'Total Completed Value', type: 'number' },
      { id: 'br_duration', label: 'Duración Estimada (Meses)', labelEn: 'Estimated Duration (Months)', type: 'number' },
      { id: 'br_location', label: 'Ubicación del Proyecto', labelEn: 'Project Location', type: 'text' },
      { id: 'br_contractor', label: 'Experiencia del Contratista General', labelEn: 'General Contractor Experience', type: 'textarea' },
      { id: 'br_security', label: 'Seguridad en el Sitio (Cercas, Guardias)', labelEn: 'Site Security (Fences, Guards)', type: 'textarea' },
    ]
  },
  {
    id: 'liquor_liability',
    name: 'Responsabilidad por Licores (Liquor Liability)',
    nameEn: 'Liquor Liability',
    description: 'Asegura a negocios que venden, sirven o fabrican alcohol.',
    descriptionEn: 'Insures businesses that sell, serve, or manufacture alcohol.',
    fields: [
      { id: 'll_liquor_sales', label: 'Ingresos por Venta de Alcohol', labelEn: 'Alcohol Sales Revenue', type: 'text' },
      { id: 'll_food_sales', label: 'Ingresos por Venta de Comida', labelEn: 'Food Sales Revenue', type: 'text' },
      { id: 'll_license', label: 'Tipo de Licencia de Licor', labelEn: 'Liquor License Type', type: 'text' },
      { id: 'll_training', label: 'Capacitación de Empleados (Ej. TIPS)', labelEn: 'Employee Training (e.g., TIPS)', type: 'boolean' },
      { id: 'll_hours', label: 'Horario de Cierre', labelEn: 'Closing Hours', type: 'text' },
    ]
  },
  {
    id: 'crime',
    name: 'Crimen Comercial',
    nameEn: 'Commercial Crime',
    description: 'Cubre robo, fraude de empleados y falsificación.',
    descriptionEn: 'Covers theft, employee fraud, and forgery.',
    fields: [
      { id: 'cr_cash', label: 'Cantidad Máxima de Efectivo en Premisas', labelEn: 'Maximum Cash on Premises', type: 'number' },
      { id: 'cr_deposits', label: 'Frecuencia de Depósitos Bancarios', labelEn: 'Bank Deposit Frequency', type: 'text' },
      { id: 'cr_audits', label: 'Frecuencia de Auditorías Financieras', labelEn: 'Financial Audit Frequency', type: 'text' },
      { id: 'cr_checks', label: 'Quien Firma Cheques y Reconcilia?', labelEn: 'Who Signs Checks and Reconciles?', type: 'textarea' },
    ]
  },
  {
    id: 'pollution',
    name: 'Responsabilidad Ambiental (Pollution Liability)',
    nameEn: 'Pollution Liability',
    description: 'Cubre daños por contaminación y costos de limpieza.',
    descriptionEn: 'Covers pollution damages and cleanup costs.',
    fields: [
      { id: 'pol_materials', label: 'Lista de Materiales Peligrosos Manejados', labelEn: 'List of Hazardous Materials Handled', type: 'textarea' },
      { id: 'pol_disposal', label: 'Métodos de Disposición de Desechos', labelEn: 'Waste Disposal Methods', type: 'textarea' },
      { id: 'pol_tanks', label: 'Existencia de Tanques Subterráneos (UST)', labelEn: 'Underground Storage Tanks (UST) Exist?', type: 'boolean' },
      { id: 'pol_reports', label: 'Reportes Ambientales Previos (Phase I/II)', labelEn: 'Previous Environmental Reports (Phase I/II)', type: 'file' },
    ]
  },
  {
    id: 'ocean_marine',
    name: 'Ocean Marine / Cargo',
    nameEn: 'Ocean Marine / Cargo',
    description: 'Asegura mercancías en tránsito marítimo o internacional.',
    descriptionEn: 'Insures goods in maritime or international transit.',
    fields: [
      { id: 'om_goods', label: 'Tipo de Mercancía Transportada', labelEn: 'Type of Goods Transported', type: 'text' },
      { id: 'om_routes', label: 'Rutas Principales (Orígenes y Destinos)', labelEn: 'Primary Routes (Origins and Destinations)', type: 'textarea' },
      { id: 'om_value', label: 'Valor Total de Envíos Anuales', labelEn: 'Total Value of Annual Shipments', type: 'number' },
      { id: 'om_max_shipment', label: 'Valor Máximo por Envío', labelEn: 'Maximum Value per Shipment', type: 'number' },
      { id: 'om_packing', label: 'Métodos de Embalaje', labelEn: 'Packing Methods', type: 'text' },
    ]
  },
  {
    id: 'product_recall',
    name: 'Retiro de Productos (Product Recall)',
    nameEn: 'Product Recall',
    description: 'Cubre costos asociados al retiro de productos defectuosos.',
    descriptionEn: 'Covers costs associated with recalling defective products.',
    fields: [
      { id: 'pr_products', label: 'Descripción de Productos Fabricados/Vendidos', labelEn: 'Description of Products Manufactured/Sold', type: 'textarea' },
      { id: 'pr_revenues', label: 'Ingresos por Producto', labelEn: 'Revenues by Product', type: 'textarea' },
      { id: 'pr_qa', label: 'Procedimientos de Control de Calidad (QA/QC)', labelEn: 'Quality Control Procedures (QA/QC)', type: 'textarea' },
      { id: 'pr_plan', label: 'Plan de Retiro de Productos Existente?', labelEn: 'Existing Product Recall Plan?', type: 'boolean' },
    ]
  },
  {
    id: 'fiduciary',
    name: 'Responsabilidad Fiduciaria',
    nameEn: 'Fiduciary Liability',
    description: 'Protege a quienes administran planes de beneficios de empleados.',
    descriptionEn: 'Protects those managing employee benefit plans.',
    fields: [
      { id: 'fid_plans', label: 'Lista de Planes Administrados (401k, Salud)', labelEn: 'List of Administered Plans (401k, Health)', type: 'textarea' },
      { id: 'fid_assets', label: 'Valor Total de Activos del Plan', labelEn: 'Total Plan Asset Value', type: 'number' },
      { id: 'fid_participants', label: 'Número de Participantes', labelEn: 'Number of Participants', type: 'number' },
      { id: 'fid_audits', label: 'Copia de Auditorías del Plan (Form 5500)', labelEn: 'Copy of Plan Audits (Form 5500)', type: 'file' },
    ]
  }
];
