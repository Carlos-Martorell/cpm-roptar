# Changelog

Todos los cambios relevantes de este proyecto quedan documentados aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [Unreleased]

---

## [0.3.0] - 2026-04-15

### Added
- Operarios activos visibles en tarjeta de pedido — avatares con iniciales en ámbar + texto "trabajando". Máximo 3 visibles, el resto como `+N`
- Operarios activos visibles en tarjeta de OF — chips con avatar e iniciales y primer nombre
- Fila de operario activo en proceso en curso — muestra iniciales, nombre completo y cronómetro `00:00:00` en tiempo real
- Tiempo reactivo mediante signal `_tick` — todos los cronómetros se actualizan cada segundo sin bloquear la UI

### Changed
- Las sesiones de los procesos ahora se consultan en tiempo real desde la vista de pedidos y OFs sin necesidad de entrar en el proceso

---

## [0.2.0] - 2026-04-15

### Added
- Flujo arranca directamente desde lista de pedidos — sin pantalla previa de selección de operario
- Banner inferior fijo con todos los procesos activos del ordenador — máquina, proceso y cronómetro en tiempo real
- Popup ligero para iniciar proceso: selección de operario en cuadrícula + máquina si no está asignada al proceso
- Popup de cambio de operario en proceso en curso
- Popup de confirmación de finalización de proceso
- Botones "Cambiar operario" y "Finalizar" directamente en la fila del proceso, sin pantalla intermedia
- Flecha `← Pedidos` visible en cabecera durante toda la navegación
- Pedidos y OFs finalizados se muestran atenuados y no son clicables
- Chips de estado de procesos visibles en tarjeta de OF

### Changed
- Navegación rediseñada: Pedidos › OFs del pedido › Procesos de la OF
- La máquina pasa a ser el elemento central del proceso — se muestra bajo el nombre del proceso
- Breadcrumb con referencia de pedido y OF en todo momento

### Removed
- Pantalla de selección de operario al inicio
- Pantalla de cronómetro a pantalla completa — sustituida por banner no intrusivo
- Botones "Salgo yo / entra otro" — reemplazados por "Cambiar operario" contextual

---

## [0.1.0] - 2026-04-14

### Added
- Estructura inicial del proyecto Angular 21 con Tailwind CSS
- Tema visual corporativo ROTPAR — azul marino `#1e2d5a` con acento ámbar industrial
- Modelos de datos: `Pedido`, `OrdenFabricacion`, `Proceso`, `Operario`, `Maquina`, `SesionTrabajo`
- Servicio de datos mock `DatosService` con 4 pedidos de ejemplo y 5 operarios
- Terminal de planta con selección de operario, navegación por pedidos, OFs y procesos
- Cronómetro activo a pantalla completa al iniciar un proceso
- Selección de máquina antes de iniciar proceso
- Configuración de build estático (`outputMode: static`, `ssr: false`) para despliegue en Netlify
- Configuración `netlify.toml` con redirección SPA
- Rama `feature/flujo-terminal-pedidos` como rama de desarrollo activa