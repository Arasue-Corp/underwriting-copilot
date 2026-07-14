# Especificación: Sistema Consolidado de Apetito, Cotizaciones y Comisiones

## 1. Roles de Usuario y Jerarquía (RBAC)
El sistema debe manejar tres niveles de acceso, agrupados bajo "Agencias":
1. **Admin Global**: Tiene visibilidad completa de todas las agencias, managers, agentes, métricas de primas y comisiones globales. Puede crear nuevas agencias y asignar Managers.
2. **Agency Manager**: Pertenece a una Agencia específica. Puede ver y gestionar a todos los Agentes de su misma agencia, visualizar sus solicitudes de cotización, subir los PDFs correspondientes y ver las métricas de rendimiento y comisiones de su agencia.
3. **Agency Agent**: Pertenece a una Agencia. Solo puede consultar el buscador de apetito, enviar solicitudes de cotización para sus clientes, subir/ver los PDFs asignados a sus propias solicitudes y ver sus métricas personales de comisiones en el dashboard.

## 2. Modelo de Base de Datos (Esquema de Tablas)
Tablas en PostgreSQL (Supabase):
- **agencies**: `id` (UUID), `name`, `logo_url`, `created_at`.
- **profiles**: `id` (UUID, FK a auth.users), `email`, `name`, `role` (ADMIN, MANAGER, AGENT), `agency_id` (FK, nullable solo para Admin), `commission_rate` (porcentaje de comisión asignado).
- **appetite_rules**: `id` (UUID), `carrier_name`, `business_class`, `naics_code`, `status` (YES, NO, REFER), `coverage_limits`, `prohibited_operations`, `eligible_states`.
- **quote_requests**: 
  - `id` (UUID)
  - `agent_id` (FK a profiles)
  - `agency_id` (FK a agencies)
  - `client_name` (Texto)
  - `client_business_type` (Texto)
  - `carrier_id` (Opcional, FK o texto)
  - `coverage_requested` (Texto)
  - `premium_amount` (Moneda, estimado/finalizado)
  - `commission_amount` (Moneda, calculado)
  - `status` (PENDING_MANAGER, QUOTED, BOUND, LOST)
  - `pdf_url` (Texto, enlace al PDF en Supabase Storage)
  - `created_at`, `updated_at`.

## 3. Flujo de Trabajo: Solicitud de Cotización (Form -> PDF)
1. **Creación**: El Agente busca en la base de datos de Apetito. Si decide cotizar, presiona "Solicitar Cotización".
2. **Formulario**: Pide datos básicos. Al enviar, el estado cambia a `PENDING_MANAGER`.
3. **Notificación & Gestión**: El Manager recibe alerta via Supabase Realtime, cotiza por fuera.
4. **Carga**: El Manager ingresa el monto de la prima (`premium_amount`), sube el PDF al bucket `quotes-bucket`, y marca como `QUOTED`.
5. **Descarga**: El Agente es notificado in-app, entra a la solicitud y descarga el PDF.

## 4. Dashboard Premium (Responsive)
- **KPI Cards**: Prima Total Cotizada, Comisiones Totales Generadas, Tasa de Conversión.
- **Gráficos**: Evolución de primas (Líneas/Áreas), Distribución (Dona). (Usando Tremor/Recharts).
- **Filtros**: Fechas, agencia, agente.
- Estilo SaaS moderno, modo oscuro, UI mobile-first con Tailwind CSS y Shadcn/UI.

## 5. ETL: Ingesta de Datos (Apetito)
- **Script**: `scripts/ingestion_pipeline.py` en Python usando `pypdf` o `pdfplumber`.
- **Procesamiento AI**: Llamada a API de Gemini con JSON Schema estricto para extraer reglas.
- **Inserción**: Volcado en `appetite_rules` usando Supabase Service Role Key.
