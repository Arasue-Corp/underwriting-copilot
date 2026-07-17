export type FieldType = 'text' | 'number' | 'textarea' | 'file' | 'select' | 'boolean';

export interface ProductField {
  id: string;
  label: string;
  type: FieldType;
  options?: string[]; // For select type
  required?: boolean;
}

export interface InsuranceProduct {
  id: string;
  name: string;
  description: string;
  fields: ProductField[];
}

export const INSURANCE_PRODUCTS: InsuranceProduct[] = [
  {
    id: 'general_liability',
    name: 'Responsabilidad Civil General (GL)',
    description: 'Protege al negocio contra reclamos por lesiones corporales a terceros, daños a la propiedad ajena, etc.',
    fields: [
      { id: 'gl_gross_revenues', label: 'Ingresos Brutos Anuales', type: 'text' },
      { id: 'gl_payroll', label: 'Nómina Total (Desglosada)', type: 'textarea' },
      { id: 'gl_subcontractors_cost', label: 'Costos de Subcontratistas', type: 'number' },
      { id: 'gl_square_footage', label: 'Pies Cuadrados (Área comercial)', type: 'number' },
      { id: 'gl_owners_count', label: 'Número de Dueños/Socios', type: 'number' },
      { id: 'gl_employees_count', label: 'Número de Empleados', type: 'number' },
    ]
  },
  {
    id: 'bop',
    name: 'Business Owner\'s Policy (BOP)',
    description: 'Paquete que combina General Liability y Commercial Property.',
    fields: [
      { id: 'bop_gross_revenues', label: 'Ingresos Brutos Anuales', type: 'text' },
      { id: 'bop_payroll', label: 'Nómina Total', type: 'text' },
      { id: 'bop_building_value', label: 'Valor del Edificio (Costo de reemplazo)', type: 'number' },
      { id: 'bop_bpp_value', label: 'Valor de Bienes Personales (BPP)', type: 'number' },
      { id: 'bop_building_characteristics', label: 'Características del Edificio', type: 'textarea' },
      { id: 'bop_business_interruption', label: 'Límites de Interrupción de Negocio', type: 'number' },
    ]
  },
  {
    id: 'commercial_property',
    name: 'Propiedad Comercial (Commercial Property)',
    description: 'Asegura los bienes inmuebles y muebles contra riesgos.',
    fields: [
      { id: 'cp_construction', label: 'Construcción (Materiales y Año)', type: 'text' },
      { id: 'cp_occupancy', label: 'Ocupación (Inquilinos y actividades)', type: 'textarea' },
      { id: 'cp_protection', label: 'Protección (Alarmas, Sprinklers, Distancia a bomberos)', type: 'textarea' },
      { id: 'cp_exposure', label: 'Exposición (Negocios colindantes)', type: 'textarea' },
      { id: 'cp_updates', label: 'Actualizaciones Mayores (Techo, plomería, HVAC, año)', type: 'textarea' },
      { id: 'cp_replacement_value', label: 'Valor de Reemplazo (Edificio)', type: 'number' },
      { id: 'cp_bpp_value', label: 'Valor de BPP', type: 'number' },
    ]
  },
  {
    id: 'workers_comp',
    name: 'Indemnización Laboral (Workers\' Comp)',
    description: 'Cubre gastos médicos y salarios perdidos de empleados lesionados.',
    fields: [
      { id: 'wc_class_codes', label: 'Códigos de Clase NCCI', type: 'text' },
      { id: 'wc_payroll_per_class', label: 'Nómina Estimada por Código de Clase', type: 'textarea' },
      { id: 'wc_employees_per_class', label: 'Número de Empleados por Código', type: 'textarea' },
      { id: 'wc_owners_status', label: 'Estatus de Socios/Dueños (Incluidos/Excluidos)', type: 'select', options: ['Incluidos', 'Excluidos'] },
      { id: 'wc_emod', label: 'Modificador de Experiencia (E-Mod)', type: 'number' },
    ]
  },
  {
    id: 'commercial_auto',
    name: 'Auto Comercial',
    description: 'Cubre vehículos propiedad de la empresa o uso comercial.',
    fields: [
      { id: 'auto_vehicles_schedule', label: 'Lista de Vehículos (VIN, Año, Marca, Modelo)', type: 'textarea' },
      { id: 'auto_gvw', label: 'Peso Bruto del Vehículo (GVW)', type: 'text' },
      { id: 'auto_radius', label: 'Radio de Operación', type: 'select', options: ['Local (<50 millas)', 'Regional (51-200 millas)', 'Larga distancia (+200 millas)'] },
      { id: 'auto_usage', label: 'Uso del Vehículo', type: 'text' },
      { id: 'auto_drivers_schedule', label: 'Lista de Conductores', type: 'textarea' },
      { id: 'auto_mvr', label: 'MVR (Multas, accidentes)', type: 'textarea' },
      { id: 'auto_garaging_zip', label: 'Código Postal de Resguardo (Garaging Zip)', type: 'text' },
    ]
  },
  {
    id: 'professional_liability',
    name: 'Responsabilidad Profesional (E&O)',
    description: 'Protege a profesionales contra reclamos de negligencia.',
    fields: [
      { id: 'eo_revenues', label: 'Ingresos Brutos Proyectados (Desglose)', type: 'textarea' },
      { id: 'eo_contracts', label: 'Copias de Contratos Estándar', type: 'file' },
      { id: 'eo_experience', label: 'Experiencia y Certificaciones', type: 'textarea' },
      { id: 'eo_quality_control', label: 'Procedimientos de Control de Calidad', type: 'textarea' },
    ]
  },
  {
    id: 'cyber_liability',
    name: 'Responsabilidad Cibernética (Cyber)',
    description: 'Cubre pérdidas por brechas de datos y ciberamenazas.',
    fields: [
      { id: 'cyber_revenues', label: 'Ingresos Anuales', type: 'number' },
      { id: 'cyber_industry', label: 'Industria / Sector', type: 'text' },
      { id: 'cyber_records_volume', label: 'Volumen de Registros (PII, PHI)', type: 'number' },
      { id: 'cyber_mfa', label: '¿Utilizan MFA?', type: 'boolean' },
      { id: 'cyber_backups', label: '¿Tienen Backups Offline?', type: 'boolean' },
      { id: 'cyber_encryption', label: '¿Usan Encriptación de Datos?', type: 'boolean' },
      { id: 'cyber_phishing_training', label: '¿Capacitación contra Phishing?', type: 'boolean' },
    ]
  },
  {
    id: 'd_and_o',
    name: 'Directores y Administradores (D&O)',
    description: 'Protege el patrimonio personal de directores ante demandas.',
    fields: [
      { id: 'do_financials', label: 'Estados Financieros Recientes', type: 'file' },
      { id: 'do_capital_structure', label: 'Estructura de Capital / Accionaria', type: 'textarea' },
      { id: 'do_funding_rounds', label: 'Historial de Rondas de Financiamiento', type: 'textarea' },
      { id: 'do_ipo_plans', label: 'Planes de Fusión/Adquisición/IPO', type: 'textarea' },
    ]
  },
  {
    id: 'epli',
    name: 'Prácticas Laborales (EPLI)',
    description: 'Cubre demandas de empleados por discriminación o acoso.',
    fields: [
      { id: 'epli_employee_count', label: 'Conteo de Empleados (Full/Part/1099)', type: 'textarea' },
      { id: 'epli_turnover_rate', label: 'Tasa de Rotación de Personal', type: 'text' },
      { id: 'epli_handbook', label: 'Manual del Empleado', type: 'boolean' },
      { id: 'epli_hr_policies', label: 'Políticas de Recursos Humanos', type: 'textarea' },
    ]
  },
  {
    id: 'inland_marine',
    name: 'Inland Marine',
    description: 'Propiedad en tránsito terrestre o herramientas móviles.',
    fields: [
      { id: 'im_equipment_schedule', label: 'Lista de Equipos/Herramientas', type: 'textarea' },
      { id: 'im_unscheduled_limit', label: 'Límite para Herramientas No Programadas', type: 'number' },
      { id: 'im_cargo_limits', label: 'Límites de Carga en Tránsito', type: 'number' },
      { id: 'im_security', label: 'Medidas de Seguridad', type: 'textarea' },
    ]
  },
  {
    id: 'commercial_umbrella',
    name: 'Paraguas Comercial (Umbrella)',
    description: 'Exceso de responsabilidad por encima de pólizas primarias.',
    fields: [
      { id: 'umbrella_underlying', label: 'Pólizas Subyacentes (Límites, Fechas)', type: 'textarea' },
      { id: 'umbrella_aggravated_risks', label: 'Exposiciones de Riesgo Agravadas', type: 'textarea' },
    ]
  },
  {
    id: 'builders_risk',
    name: 'Seguro de Construcción (Builder\'s Risk)',
    description: 'Cubre edificaciones en proceso de construcción.',
    fields: [
      { id: 'br_project_value', label: 'Valor Total del Proyecto (Hard/Soft costs)', type: 'textarea' },
      { id: 'br_cope_data', label: 'Datos COPE del Proyecto', type: 'textarea' },
      { id: 'br_duration', label: 'Duración del Proyecto (Fechas)', type: 'text' },
      { id: 'br_site_security', label: 'Seguridad del Sitio', type: 'textarea' },
      { id: 'br_contractor_experience', label: 'Experiencia del Contratista', type: 'textarea' },
    ]
  },
  {
    id: 'liquor_liability',
    name: 'Responsabilidad por Venta de Alcohol',
    description: 'Daños causados por un cliente intoxicado.',
    fields: [
      { id: 'liquor_revenues', label: 'Ingresos Anuales por Alcohol (%)', type: 'text' },
      { id: 'liquor_establishment_type', label: 'Tipo de Establecimiento', type: 'select', options: ['Bar/Antro', 'Restaurante', 'Liquor Store', 'Banquetes'] },
      { id: 'liquor_certifications', label: 'Certificaciones del Personal (TIPS/RAMP)', type: 'boolean' },
      { id: 'liquor_hours', label: 'Horario de Operación (Hora de cierre)', type: 'text' },
      { id: 'liquor_citations', label: 'Historial de Citaciones', type: 'textarea' },
    ]
  },
  {
    id: 'commercial_crime',
    name: 'Delitos Comerciales (Commercial Crime)',
    description: 'Pérdidas por robo, falsificación, fraude.',
    fields: [
      { id: 'crime_employees_access', label: 'Número de Empleados con Acceso a Fondos', type: 'number' },
      { id: 'crime_dual_signatures', label: '¿Firmas Dobles para Cheques?', type: 'boolean' },
      { id: 'crime_reconciliation', label: '¿Conciliación Separada?', type: 'boolean' },
      { id: 'crime_audits', label: '¿Auditorías Externas Anuales?', type: 'boolean' },
      { id: 'crime_max_cash', label: 'Efectivo Máximo en Resguardo', type: 'number' },
    ]
  },
  {
    id: 'pollution_liability',
    name: 'Responsabilidad Ambiental (Pollution)',
    description: 'Contaminación del suelo, aire o agua.',
    fields: [
      { id: 'poll_materials', label: 'Tipos de Materiales/Químicos Manejados', type: 'textarea' },
      { id: 'poll_land_history', label: 'Uso Histórico del Terreno', type: 'textarea' },
      { id: 'poll_proximity', label: 'Proximidad a Zonas Sensibles', type: 'textarea' },
      { id: 'poll_disposal', label: 'Métodos de Disposición de Residuos', type: 'textarea' },
    ]
  },
  {
    id: 'ocean_marine',
    name: 'Transporte Marítimo (Ocean Marine)',
    description: 'Carga internacional marítima o aérea.',
    fields: [
      { id: 'ocean_routes', label: 'Método de Envío y Rutas Habituales', type: 'textarea' },
      { id: 'ocean_commodity', label: 'Tipo de Mercancía (Commodity)', type: 'text' },
      { id: 'ocean_max_limit', label: 'Límite Máximo por Envío', type: 'number' },
      { id: 'ocean_annual_volume', label: 'Volumen Anual Asegurado', type: 'number' },
      { id: 'ocean_incoterms', label: 'Términos de Venta (Incoterms)', type: 'text' },
    ]
  },
  {
    id: 'product_recall',
    name: 'Retirada de Productos (Product Recall)',
    description: 'Costos de retirar un producto del mercado.',
    fields: [
      { id: 'recall_revenues', label: 'Ingresos Brutos por Línea de Producto', type: 'textarea' },
      { id: 'recall_traceability', label: 'Sistemas de Trazabilidad y Lotes', type: 'textarea' },
      { id: 'recall_qc', label: 'Protocolos de Control de Calidad', type: 'textarea' },
      { id: 'recall_crisis_plan', label: 'Plan de Gestión de Crisis', type: 'boolean' },
    ]
  },
  {
    id: 'fiduciary_liability',
    name: 'Responsabilidad Fiduciaria',
    description: 'Mala administración de planes de beneficios (ERISA).',
    fields: [
      { id: 'fid_assets', label: 'Activos Totales bajo el Plan', type: 'number' },
      { id: 'fid_participants', label: 'Número de Participantes', type: 'number' },
      { id: 'fid_tpa', label: 'Uso de Terceros Administradores (TPA)', type: 'text' },
      { id: 'fid_audits', label: 'Historial de Auditorías (Formulario 5500)', type: 'file' },
    ]
  }
];
