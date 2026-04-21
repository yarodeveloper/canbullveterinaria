# Documentación Técnica: Módulo de Cotizaciones e Integración PDV

Este documento detalla el funcionamiento, la arquitectura y los procesos clave del sistema de cotizaciones (Cotizador) y su comunicación con el Punto de Venta (PDV) en el sistema CanBull.

## 1. Flujo de Trabajo (Workflow)

### A. Creación de Cotización
- **Clientes**: Soporta clientes registrados y "Público en General" (clientes manuales).
- **Ítems**: Permite agregar productos del inventario o descripciones libres para servicios especiales.
- **Plantillas**: Uso de `ServiceTemplates` para cargar conjuntos predefinidos de insumos y servicios.
- **Cantidades**: Soporta decimales (ej. 0.5 tabletas) para precisión en dosis médicas.

### B. Conversión a Cargos Pendientes (PDV)
- **Activación**: Disponible solo para cotizaciones con estado "Aceptada".
- **Lógica de Conversión**: 
    - Si el ítem no tiene un `product_id` (es manual), se vincula automáticamente al producto genérico `COT-MANUAL` (SKU).
    - Se crean registros en la tabla `pending_charges` vinculados a la cotización mediante `source_quote_id`.
    - Se respeta la descripción y el precio exacto definido en la cotización, sobrescribiendo los valores del catálogo si es necesario.
- **Redirección**: El sistema envía al usuario directamente al PDV con el cliente pre-seleccionado.

### C. Proceso de Cobro y Cierre
- **Cobro en PDV**: Al finalizar la venta de un cargo pendiente que proviene de una cotización:
    - El estado de la `Quote` cambia automáticamente de "Aceptada" a **"Cobrada"**.
    - El cargo pendiente cambia a estado `invoiced`.
- **Bloqueo de Seguridad**: Una cotización con estado "Cobrada" no permite cambios de estatus ni modificaciones de ítems para garantizar la integridad financiera.

---

## 2. Componentes Técnicos

### Modelos y Base de Datos
- **Quote / QuoteItem**: Almacenan la cabecera y el detalle de la cotización.
- **PendingCharge**: Se modificó para incluir:
    - `source_quote_id`: FK que vincula el cargo con la cotización original.
    - `description` y `price`: Permiten manejar ítems manuales sin depender del catálogo fijo.
- **Product (`COT-MANUAL`)**: Actúa como comodín para servicios no inventariados. Se crea automáticamente si no existe.

### Controladores Clave
- **`QuoteController@convertToCharge`**: Orquestador de la migración de datos de la cotización a la caja. Implementa validaciones anti-duplicados.
- **`QuoteController@revertConversion`**: Permite eliminar los cargos del PDV si el envío fue erróneo, siempre que no hayan sido cobrados.
- **`ReceiptController@store`**: Detecta cargos vinculados a cotizaciones y actualiza sus estados al finalizar la venta.

---

## 3. Guía de Mantenimiento

### Actualización de Estados
Si se desea agregar nuevos estados, estos deben registrarse en:
1.  Validación en `QuoteController@update`.
2.  `STATUS_CONFIG` en `resources/js/Pages/Quotes/Index.jsx`.
3.  `STATUS_CONFIG` en `resources/js/Pages/Quotes/Show.jsx`.

### Impresión y PDF
- El diseño utiliza CSS Grid y `@media print` para asegurar que el reporte impreso oculte botones de interfaz y se ajuste a una sola hoja (letter size) preferentemente.
- La generación de PDF utiliza `html2pdf.js` capturando el contenedor `#pdf-download-wrapper`.

### Resolución de Problemas (FAQ)
- **¿Por qué no cambia el botón a "Revertir"?**: Verifica que la relación `pending_charges` esté cargada en el controlador y que el campo en el frontend sea snake_case.
- **¿Error de truncamiento en Status?**: El campo `status` en la BD debe ser `string` o un `ENUM` que incluya todos los estados (Borrador, Enviada, Aceptada, Rechazada, Vencida, Cobrada).
