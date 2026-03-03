# CanBull Veterinary System - Implementation Plan

## 📌 Proyecto: Sistema de Gestión Veterinaria Integral (Web & Mobile)

Este plan detalla la implementación del sistema basado en el esquema general proporcionado.

---

## 🏗️ Fase 1: Arquitectura Base y Datos
- [x] Estructura inicial del proyecto (Laravel 12 + Inertia + React)
- [x] Modelo de Mascota (`Pet`) y Relación con Dueño (`User`)
- [x] Configuración MySQL
- [x] **Sistema de Permisos Granulares:**
    - Roles: Admin, Veterinario, Recepcionista, Groomer, Farmacéutico, Cliente.
    - Manejo de permisos por módulo (Spatie Permissions).

## 🏥 Fase 2: Módulos Clínicos (Core)
- [x] **Historia Clínica Digital:**
    - [x] Registro de visitas bajo formato **SOAP** premium.
    - [x] Carga de adjuntos (Imágenes, PDF, Radiografías).
    - [x] Alertas inteligentes de signos vitales.
- [x] **Vacunación y Desparasitación:**
    - [x] Esquemas configurables por edad/especie (Protocolos de Salud).
    - [x] Cálculo automático de próximas dosis.
    - [x] Generación de carnet digital premium con QR y Sello Oficial.
    - [x] Indicador de protección (Health Score).
- [/] **Hospitalización / Internación:**
    - [x] Monitorización de constantes vitales.
    - [x] **Kardex Diario** y manejo de anestesia (Anestesia en progreso).
    - [ ] **Protocolo de Eutanasia & Alta Voluntaria** (UI básica lista).
- [x] **Cirugías & Laboratorio:**
    - [x] Checklists pre/intra/post-op.
    - [ ] Integración de resultados de laboratorio con gráficas de tendencia.

## ⚙️ Fase 3: Operaciones y Administración
- [x] **Agenda Inteligente:**
    - Gestión por recursos (Veterinario, Quirófano, Mesa de Grooming).
    - Reserva online para clientes (Conceptualmente lista vía CMS).
- [x] **Inventario & Farmacia:**
    - [x] Control de lotes y caducidades.
    - [x] **Sub-módulo de Farmacia:** Dispensación controlada vinculada a recetas médicas (Base lista).
- [x] **Finanzas & Arqueos (Recibos):**
    - [x] Generación de recibos de pago (Hospitalización, Grooming, Farmacia).
    - [x] Control de caja diaria (Entradas y salidas).
    - [x] Reportes financieros básicos (Punto de Venta).
- [ ] **Mensajería Automatizada:**
    - Integración con API de WhatsApp/SMS/Email para recordatorios y campañas.

## 💰 Fase 4: Módulos Financieros y Fiscales (México Focus)
- [ ] **Facturación CFDI 4.0:**
    - Conexión con PAC y timbrado.
    - Lógica de IVA exento en servicios médicos según normativa SAT.
- [ ] **Punto de Venta (POS):**
    - Cobro rápido de servicios y productos.
    - Apertura/Cierre de caja y arqueos.
- [ ] **Nómina y Contabilidad:**
    - Generación de asientos automáticos.
    - CFDI de Nómina.

## ⚖️ Fase 5: Transversal y Legal
- [ ] **Generador de Consentimientos (PDF):**
    - Firma digital/táctil para responsabilidades, cirugías y eutanasia.
- [ ] **Dashboards & KPIs:**
    - Reportes de ocupación, ingresos y cumplimiento clínico.

---

## 🔍 Análisis, Dudas y Sugerencias de Mejora

El esquema es sumamente sólido y cubre el 100% de la operación veterinaria moderna en México. Tras analizarlo, aquí mis observaciones:

### ❓ Dudas para definir el desarrollo:
1. **Multisucursal:** ¿El sistema debe soportar múltiples clínicas/sucursales bajo una misma cuenta de empresa?
2. **Almacenamiento de Imágenes:** Las radiografías y fotos pueden pesar mucho. ¿Usaremos almacenamiento local en el servidor o un servicio como AWS S3?
3. **Firma de Consentimientos:** ¿La firma se capturará en tabletas/celulares directamente en la clínica o se enviará por correo para firma remota?

### 💡 Sugerencias de Mejora:
1. **Audit Log (Trazabilidad):** Es crítico para el cumplimiento legal (especialmente en farmacia de medicamentos controlados y cambios en la historia clínica) registrar *quién*, *cuándo* y *qué* se modificó. Yo añadiría un módulo de auditoría silenciosa.
2. **PWA (App Móvil):** Dado que mencionas acceso en PC y Móvil, implementar una **Progressive Web App** permitiría usar la cámara para escanear microchips o tomar fotos de los pacientes de forma nativa.
3. **Portal del Cliente:** Permitir que los dueños vean el carnet de vacunación y agenden citas desde su propio acceso aumentaría mucho la fidelización.
4. **Triage de Urgencias:** Implementar un semáforo de prioridad en la agenda para pacientes que llegan en estado crítico.
