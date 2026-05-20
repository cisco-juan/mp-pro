# Reporte de Módulos — MP Pro Backoffice

**Fecha:** 2026-05-19  
**Versión:** Fase 1 (estructura base + dominio completo)  
**Entorno probado:** API (NestJS :3000) + Dashboard (Next.js :3001) + PostgreSQL (Docker :5432)

---

## Resumen Ejecutivo

| Módulo | Estado | Completitud | Prioridad de mejoras |
|--------|--------|-------------|---------------------|
| Login / Auth | ✅ Completo | 95% | Baja |
| Dashboard | ✅ Completo | 90% | Media |
| Clientes | ✅ Completo | 95% | Baja |
| Vehículos | ✅ Completo | 90% | Media |
| Citas | ✅ Completo | 90% | Media |
| Taller (OTs) | ✅ Completo | 95% | Baja |
| Inventario | ✅ Completo | 85% | Media |
| Servicios | ✅ Completo | 80% | Media |
| Órdenes Comerciales | ✅ Completo | 90% | Baja |
| Pagos | ✅ Completo | 75% | Alta |
| Usuarios y Roles | ✅ Completo | 85% | Media |
| Configuración | ✅ Completo | 85% | Media |

---

## 1. Login / Autenticación

### Flujo probado
1. `POST /api/auth/login` → tokens JWT (access + refresh)
2. Refresh token rotation (`POST /api/auth/refresh`)
3. Logout con revocación de refresh token
4. Middleware de Next.js redirige a `/login` sin cookie `mp_auth`
5. Guard de JWT rechaza peticiones sin token (401)
6. Credenciales inválidas → 401 "Credenciales inválidas"

### ✅ Completo
- Login con email/password + JWT
- Refresh token con rotación
- Logout con revocación
- Middleware de protección de rutas en el dashboard
- Pre-filled demo credentials en la UI
- Persistencia en localStorage + cookie

### ❌ Faltante
- Recuperación de contraseña (forgot password)
- Registro de nuevos usuarios desde el login (solo admin puede crear)
- MFA / 2FA
- Rate limiting en intentos de login

### 💡 Mejoras sugeridas
- Añadir rate limiting al endpoint de login (protección brute-force)
- Implementar reset de contraseña por email
- Añadir sesiones activas visibles al usuario (cerrar otras sesiones)
- Validación server-side del JWT en middleware de Next.js (actualmente solo verifica cookie flag)

---

## 2. Dashboard (Vista General)

### Flujo probado
- Carga de stats (citas hoy, OTs abiertas, stock bajo, ingresos del mes)
- Gráfico de citas de la semana (Recharts)
- Próximas citas con enlaces a detalle
- Actividad reciente (timeline)
- Links rápidos a módulos principales

### ✅ Completo
- 4 tarjetas de resumen con datos en tiempo real
- Gráfico de barras de citas semanales
- Lista de próximas citas
- Feed de actividad reciente
- Quick links a Taller, Inventario, Órdenes, Usuarios

### ❌ Faltante
- KPIs financieros (ingresos acumulados, por cobrar, promedio por OT)
- Alertas de mantenimientos vencidos
- Indicador de ocupación de bahías en tiempo real
- Notificaciones push / en-app

### 💡 Mejoras sugeridas
- Widget de ocupación de bahías (capacity planning)
- Filtro de rango de fechas para el gráfico
- Métricas de rendimiento por mecánico
- Dashboard personalizable (drag & drop widgets)
- Gráfico de ingresos vs gastos

---

## 3. Clientes

### Flujo probado
1. Listado con búsqueda y paginación
2. Creación de cliente (dialog con todos los campos)
3. Detalle del cliente con tabs (vehículos, historial, taller, órdenes, pagos)
4. Edición vía sheet
5. Activar/desactivar (soft delete)
6. Creación inline de vehículo al crear cliente

### ✅ Completo
- CRUD completo (Create, Read, Update, Toggle-active)
- Formulario con validación (nombre, email, teléfono, dirección, documento)
- Vista detallada con resumen de relaciones
- Tabla de vehículos asociados
- Histórico de visitas, OTs y órdenes comerciales
- Paginación y búsqueda

### ❌ Faltante
- Exportación de clientes (CSV/Excel)
- Historial de comunicaciones
- Integración con email/SMS para recordatorios
- Merge de clientes duplicados

### 💡 Mejoras sugeridas
- Filtros avanzados (por estado, provincia, empresa, fecha última visita)
- Importación masiva de clientes (CSV)
- Vista de mapa con ubicaciones
- Dashboard de cliente individual (métricas de gasto total, frecuencia visitas)

---

## 4. Vehículos

### Flujo probado
1. Listado con búsqueda y filtros
2. Creación de vehículo (vinculado a cliente)
3. Detalle con tabs (citas, mantenimiento, reparaciones, piezas, órdenes, garantías)
4. Edición y toggle de estado
5. Indicador de urgencia de mantenimiento

### ✅ Completo
- CRUD completo
- Vinculación a cliente obligatoria
- Campos: matrícula, marca, modelo, año, color, kilometraje, próximo mantenimiento
- Vista detalle con historial completo
- Indicador visual de urgencia de mantenimiento

### ❌ Faltante
- Historial de kilometraje (evolución)
- Fotos del vehículo
- Ficha técnica / documentos adjuntos
- VIN (número de bastidor)
- Garantías reales (actualmente usa mock data)

### 💡 Mejoras sugeridas
- Añadir campo VIN y decodificación automática de marca/modelo
- Upload de fotos y documentos (ITV, seguro, etc.)
- Alertas automáticas de próximo mantenimiento
- Garantías con backend real (actualmente mock en frontend)
- Historial gráfico de kilometraje

---

## 5. Citas

### Flujo probado
1. Vista semanal (grid calendar)
2. Vista lista (tabla)
3. Creación de cita (dialog con cliente, vehículo, servicio, fecha, hora, duración)
4. Detalle de cita con acciones de estado
5. Transición: pendiente → confirmada → completada/cancelada

### ✅ Completo
- Doble vista (semana / lista)
- Creación con vinculación automática a servicio del catálogo
- Detalle con info completa
- Cambio de estado (confirmar, completar, cancelar)
- Edición de cita existente
- Filtro por fecha

### ❌ Faltante
- Vista mensual
- Detección de conflictos de horario (misma bahía / mismo mecánico)
- Arrastrar y soltar para re-agendar
- Recordatorios automáticos al cliente (email/SMS)
- Citas recurrentes

### 💡 Mejoras sugeridas
- Verificación de disponibilidad al crear cita
- Notificaciones al cliente (email/SMS 24h antes)
- Vista mensual con densidad visual
- Integración con Google Calendar
- Cita → OT automática al marcar completada

---

## 6. Taller (Órdenes de Trabajo)

### Flujo probado
1. Vista Kanban con 4 columnas (Pendiente, En progreso, Esperando piezas, Completado)
2. Vista tabla alternativa
3. Creación de OT con checklist por defecto
4. Detalle con: checklist toggle, timeline, piezas, asignación de mecánico
5. Cambio de estado con nota opcional
6. Generación de cotización desde OT
7. Gestión de piezas (agregar, reemplazar, eliminar)

### ✅ Completo
- Kanban funcional con @dnd-kit (drag & drop)
- CRUD completo de OTs
- Checklist interactivo con progreso (%)
- Timeline de estados con notas
- Asignación de mecánico
- Vinculación con orden comercial
- Generación de cotización automática desde piezas de la OT
- Gestión de piezas usadas (CRUD)

### ❌ Faltante
- Drag & drop entre columnas del Kanban para cambiar estado
- Temporizador / horas trabajadas por OT
- Historial de re-asignaciones
- Adjuntos (fotos del problema/reparación)
- Alertas de OTs estancadas

### 💡 Mejoras sugeridas
- Timer por OT para medir horas reales de trabajo
- Fotos antes/después de la reparación
- Alertas automáticas si OT lleva >48h sin cambio de estado
- Plantillas de checklist por tipo de servicio
- Reportes de productividad por mecánico

---

## 7. Inventario

### Flujo probado
1. Listado con alertas de stock bajo
2. Creación de pieza (código, nombre, categoría, ubicación, stock, mínimo, precio)
3. Ajuste de stock (delta positivo/negativo)
4. Reserva de stock

### ✅ Completo
- Listado con indicadores de stock (OK / bajo)
- Categorización
- Ubicación en almacén
- Ajuste de stock incremental
- Reserva de piezas
- Toggle activo/archivado
- Resumen de alertas de stock bajo

### ❌ Faltante
- Historial de movimientos de stock (log)
- Proveedores vinculados
- Órdenes de compra
- Código de barras / QR
- Alertas automáticas de reposición
- Imágenes de piezas
- Costo promedio vs precio de venta

### 💡 Mejoras sugeridas
- Módulo de proveedores con precios
- Órdenes de compra automáticas al alcanzar stock mínimo
- Trazabilidad de movimientos (quién, cuándo, por qué)
- Escáner de código de barras
- Control de lotes y fechas de caducidad (para líquidos)
- Reportes de rotación de inventario

---

## 8. Servicios (Catálogo)

### Flujo probado
1. Listado de servicios con categoría, duración, precio
2. Creación de servicio
3. Toggle activo/inactivo
4. Búsqueda y filtro por categoría

### ✅ Completo
- CRUD básico (crear, listar, activar/desactivar)
- Campos: nombre, descripción, categoría, duración (min), precio
- Filtro por categoría
- Toggle de disponibilidad

### ❌ Faltante
- Edición de servicio existente (el UI no tiene form de edición, solo toggle)
- Paquetes/combos de servicios
- Asociación de piezas por defecto a un servicio
- Precios por tipo de vehículo
- Histórico de precios

### 💡 Mejoras sugeridas
- Formulario de edición completo (PATCH existe en API pero no hay UI de edit)
- Paquetes de servicios (ej: "Revisión completa" = aceite + filtros + frenos)
- Precio variable por tipo/modelo de vehículo
- Tiempo estimado basado en historial real
- Imágenes/iconos por categoría

---

## 9. Órdenes Comerciales (Cotizaciones / Facturas)

### Flujo probado
1. Listado con toggle Cotizaciones / Facturas
2. Generación de cotización desde OT (`POST /commercial-orders/from-work-order`)
3. Detalle con líneas, subtotal, IVA, total
4. Transición de estados (enviada → aceptada → convertir a factura)
5. Conversión de cotización aceptada a factura
6. Vinculación con OT y vehículo

### ✅ Completo
- Generación automática desde OT (piezas + servicio vinculado)
- Numeración automática (COT-2026-XXXX, FAC-2026-XXXX)
- Cálculo automático de IVA (configurable desde settings)
- Workflow de estados completo
- Conversión cotización → factura
- Vista detallada con desglose de líneas
- Vinculación bidireccional OT ↔ Orden comercial

### ❌ Faltante
- Creación manual de cotización independiente (UI button exists pero sin handler)
- Descuentos por línea o global
- Notas/condiciones en la cotización
- Generación de PDF
- Envío por email al cliente
- Factura de abono / nota de crédito
- Firmas digitales

### 💡 Mejoras sugeridas
- Generación de PDF para impresión/envío
- Plantilla personalizable de cotización/factura
- Descuentos (porcentaje o fijo) por línea y/o globales
- Envío automático por email
- Historial de versiones de cotización
- Integración con contabilidad

---

## 10. Pagos

### Flujo probado
1. Listado de pagos con búsqueda y filtro por método
2. Registro de pago (vinculado a factura emitida)
3. Validación: solo sobre facturas (no cotizaciones)
4. Validación: la factura debe estar en estado "emitida" o "pagada"
5. Métodos: efectivo, tarjeta, transferencia

### ✅ Completo
- Registro de pagos vinculados a facturas
- Validación de estado (solo facturas emitidas)
- Referencia de transacción
- Filtros por método de pago
- Tres métodos soportados

### ❌ Faltante
- Pagos parciales con seguimiento del saldo pendiente
- Conciliación bancaria
- Comprobante/recibo generado
- Devoluciones / reembolsos
- Histórico de intentos fallidos
- Resumen financiero (cobrado vs pendiente)

### 💡 Mejoras sugeridas
- Dashboard financiero (ingresos por período, métodos, mecánico)
- Soporte pagos parciales con balance pendiente
- Generación de recibo PDF
- Integración con pasarela de pago (Stripe, Redsys)
- Exportación contable (formato compatible con programas de contabilidad)
- Alertas de facturas vencidas sin pagar

---

## 11. Usuarios y Roles

### Flujo probado
1. Listado de usuarios (vista tarjetas y tabla)
2. Tab de roles con permisos detallados
3. Creación de usuario con rol asignado
4. Toggle activo/inactivo
5. RBAC: mecánico no puede acceder a `/api/users` (403 Forbidden)

### ✅ Completo
- CRUD de usuarios
- RBAC funcional con permisos granulares
- 4 roles predefinidos (Admin, Mecánico, Recepcionista, Administración)
- 14 permisos distintos
- Toggle de activación
- Indicador de OTs activas por mecánico
- Creación de roles personalizados

### ❌ Faltante
- Edición de usuario existente (UI solo tiene toggle, no form edit)
- Edición de roles existentes (no hay PATCH en API)
- Eliminar rol (no hay DELETE)
- Cambio de contraseña (propio o por admin)
- Foto de perfil
- Log de actividad por usuario

### 💡 Mejoras sugeridas
- Formulario de edición de usuario completo
- Cambio de contraseña (auto + admin reset)
- Audit log de acciones por usuario
- Permisos más granulares (ej: separar `taller:read` de `taller:write`)
- Foto de perfil / avatar personalizable
- UI para editar permisos de roles existentes

---

## 12. Configuración

### Flujo probado
1. Tab General: nombre, CIF, dirección
2. Tab Taller: horario apertura/cierre, número de bahías
3. Tab Notificaciones: toggles para citas, OTs, recordatorios
4. Tab Facturación: series, IVA por defecto
5. PATCH funcional desde API

### ✅ Completo
- 4 secciones bien organizadas
- Persistencia en base de datos
- Campos configurables que afectan otros módulos (IVA, series)
- Toggles de notificaciones

### ❌ Faltante
- Logo del taller (branding)
- Días festivos / días no laborables
- Configuración de email (SMTP para envíos)
- Backup / exportación de datos
- Multi-sucursal

### 💡 Mejoras sugeridas
- Upload de logo para cotizaciones/facturas
- Calendario de festivos configurable
- Configuración de notificaciones por canal (email, SMS, push)
- Temas de color / branding personalizable
- Backup automático programado
- Plantillas de email editables

---

## Flujos End-to-End Verificados

### Flujo 1: Cliente → Vehículo → Cita → OT → Cotización → Factura → Pago ✅

| Paso | Endpoint | Resultado |
|------|----------|-----------|
| Crear cliente | `POST /clients` | ✅ `cmpd921sw...` |
| Crear cita | `POST /appointments` | ✅ `cmpdalqbq...` |
| Crear OT | `POST /work-orders` | ✅ `OT-2026-0145` |
| Generar cotización | `POST /commercial-orders/from-work-order` | ✅ `COT-2026-0091` |
| Aceptar cotización | `PATCH /commercial-orders/:id/estado` | ✅ |
| Convertir a factura | `POST /commercial-orders/:id/convert-to-invoice` | ✅ `FAC-2026-0046` |
| Emitir factura | `PATCH /commercial-orders/:id/estado` | ✅ |
| Registrar pago | `POST /payments` | ✅ `cmpdamozn...` |

### Flujo 2: Gestión de Inventario ✅

| Paso | Resultado |
|------|-----------|
| Listar piezas con stock bajo | ✅ 2 alertas |
| Ajustar stock (+5 filtros aceite) | ✅ 24 → 29 |
| Reservar stock | ✅ API funcional |

### Flujo 3: Control de Acceso ✅

| Paso | Resultado |
|------|-----------|
| Login admin → acceso completo | ✅ 14 permisos |
| Login mecánico → acceso limitado | ✅ solo taller, inventario:read, servicios:read |
| Mecánico → GET /users | ✅ 403 Forbidden |
| Sin token → cualquier endpoint | ✅ 401 Unauthorized |

---

## Resumen de Hallazgos Críticos

### Lo que funciona bien ✅
1. **CRUD completo** en todos los módulos principales
2. **RBAC funcional** con permisos granulares
3. **Flujo E2E** completo de cliente a pago
4. **UI profesional** con Kanban, calendarios, y componentes modernos
5. **Validaciones** tanto en frontend como en backend
6. **Soft-delete** pattern consistente (toggle-active)
7. **Numeración automática** de OTs, cotizaciones y facturas
8. **Cálculo automático** de IVA configurable

### Brechas principales ❌
1. **Sin generación de PDF** (cotizaciones, facturas, recibos)
2. **Sin sistema de notificaciones** (email/SMS/push)
3. **Sin historial de cambios** (audit log)
4. **Edición limitada en UI** (servicios y usuarios carecen de form edit)
5. **Garantías mock** en frontend (no hay backend)
6. **Sin exportación de datos** (CSV, Excel, contable)
7. **Botón "Nueva cotización"** sin funcionalidad (UI-only)

### Top 5 Mejoras Prioritarias 🚀
1. **Generación de PDF** para cotizaciones y facturas (impacto directo en el negocio)
2. **Pagos parciales** con seguimiento de saldo (flujo financiero más realista)
3. **Notificaciones** al cliente (recordatorios de citas, facturas pendientes)
4. **Audit log** de cambios por usuario (trazabilidad)
5. **Edición completa** en UI para servicios y usuarios (la API ya soporta PATCH)
