# Plan aprobado: dashboards horizontales translúcidos

Fecha: 2026-10-03. El usuario eligió navegación horizontal para conservar el ancho
actual de la información. Esta decisión sustituye la propuesta inicial de sidebar.

## Implementación

1. Conservar las estructuras, botones, handlers, estados, consultas y permisos.
2. Añadir clases de presentación compartidas a siete dashboards y al panel de
   estadísticas reutilizado. Encabezado grafito translúcido, fondo con gradientes
   discretos y navegación horizontal desplazable cuando no quepa.
3. Mantener tablas y formularios sobre superficies claras opacas. No aplicar
   transparencia a todo el contenido ni cambiar estilos de las pantallas públicas.
4. Añadir indicación accesible de selección a los botones de navegación actuales.
5. Revisar con datos ficticios las siete rutas, selección de pestañas, NHO semanal
   e historial, teclado, scroll y tamaños de pantalla. Ejecutar el harness.
6. Registrar evidencia, limitaciones y reversión. No integrar ni desplegar si las
   comprobaciones necesarias fallan. Esta rama es el entorno aislado de trabajo.

No se necesita un shell nuevo ni un flag en producción: conservar el árbol React
reduce el cambio y la rama permite revisar y revertir la presentación completa.
Sin cambios de backend, autenticación, modelos ni migraciones. Sin dependencias nuevas.

## Aceptación

- Todas las opciones previas siguen presentes, seleccionables y con los mismos callbacks.
- Las cuatro consultas semanales del reclutador permanecen iguales; los otros
  roles conservan sus filtros. Historial mantiene su estado independiente.
- Encabezados adaptables, texto legible, foco visible y desplazamiento horizontal
  solo en navegación/tablas cuando sea necesario; Row Generator conserva su scroll.
- El estilo tiene fallback sin blur y respeta movimiento reducido.
- Build y pruebas pasan; cero errores TypeScript nuevos. Documentar límites del
  entorno sintético y cualquier fallo previo sin atribuirlos a esta revisión.

## Propuesta inicial sustituida (contexto)


Fecha: 2026-10-03. Estado: análisis y propuesta; sin implementación ni despliegue.
Referencia: imagen aportada por el usuario, con sidebar oscuro translúcido.

## Objetivo visual

Dar coherencia a los siete dashboards de roles con un menú lateral de cristal
esmerilado: fondo grafito con gradientes suaves, paneles semitransparentes, bordes
finos luminosos, esquinas redondeadas y sombras discretas. Propuesta de acento:
verde Kelly para selección y acciones principales; mantener rojo para errores o
acciones destructivas. No copiar los controles de Instagram ni inventar funciones
como cambio de cuenta, notificaciones o búsqueda global a partir de la referencia.

Sidebar de aproximadamente 260 px, plegable en escritorio, con identidad del
usuario, opciones actuales del rol y cierre de sesión. En móvil, menú desplegable
con botón, Escape, gestión del foco y etiquetas accesibles. Zona principal amplia
para tablas. Encabezado con título y acciones existentes, sin inventar métricas.

Aplicar transparencia principalmente al sidebar, encabezado y contenedores.
Tablas y formularios conservan una superficie suficientemente opaca. El texto no
hereda opacidad del contenedor. El diseño debe ser usable sin desenfoque, con
fondo sólido alternativo, y respetar reducción de movimiento. Evitar animación
continua del fondo y múltiples capas grandes con blur por su coste visual.

## Hallazgos del código

- React, Vite y Tailwind ya permiten una capa visual compartida; no se plantea
  cambiar framework ni añadir una librería de animación para este alcance.
- `App.tsx` define siete rutas de dashboards: admin, management, frontdesk,
  talent, recruiter, staff y user. `StatisticsDashboard` es contenido reutilizado.
- Varios paneles mantienen `activeTab`, botones y carga/refresco de datos dentro
  del mismo archivo. Admin usa otra estructura y enlaces a páginas de configuración.
- Existen estilos repetidos `bg-white`, `bg-gray-100` y colores por estado.
  Reemplazarlos globalmente puede alterar pantallas públicas y legibilidad.
- Recruiter conserva cuatro llamadas `getNewHireOrientations(7, true)`; otros
  roles llaman sin esos argumentos. Preservar cada comportamiento durante el
  rediseño, sin unificar filtros de datos como efecto secundario.
- El editor de Row Generator tiene reglas explícitas de scroll que deben mantenerse.
- El harness actual prueba API NHO y build; no cubre interacción de navegador
  en los siete roles. La deuda TypeScript conocida no debe aumentar.

## Diseño técnico propuesto

Crear una envoltura visual `DashboardShell` y un componente de navegación que
reciban elementos, selección y callbacks desde cada dashboard. Los paneles siguen
siendo dueños de sus estados, efectos, consultas y permisos. Los enlaces de admin
siguen navegando a sus rutas; los tabs mantienen sus identificadores y callbacks.
No mover la carga de datos ni recrear componentes de contenido al plegar el menú.

Definir variables de color, superficie, borde, radio y sombra bajo una clase
específica de dashboard. Evitar redefinir globalmente `.bg-white`, `button` o
`table`. Los diálogos renderizados mediante portal necesitan su propia clase de
tema: el alcance CSS del contenedor no necesariamente llega a ellos.

El flag visual de preview se decide al cargar, con diseño actual como valor por
defecto durante las pruebas. Solo selecciona presentación; nunca concede acceso,
cambia consultas ni activa funciones para un rol. La vuelta al diseño anterior
requiere recargar y debe probarse. Retirar la duplicación temporal tras estabilizar.

## Secuencia de ejecución

1. Registrar la lista exacta de menús, acciones, rutas, permisos y estados de cada
   rol, y capturar una referencia de funcionamiento con datos ficticios.
2. Preparar una preview aislada del shell con menú y tabla de ejemplo, para evaluar
   parecido, legibilidad y tamaños sin conectar a datos de producción.
3. Integrar primero Recruiter en una rama: probar semana actual, historial, modal,
   actualización y Row Generator. Conservar handlers, efectos y firmas de API.
4. Aplicar el mismo shell a frontdesk, management, talent, staff y user, validando
   uno por uno; adaptar admin sin convertir sus enlaces en tabs arbitrariamente.
5. Revisar componentes interiores y portales que requieran ajustes de contraste.
   La primera fase no rediseña pantallas públicas ni la presentación de TV/kiosco.
6. Ejecutar harness y pruebas de navegador por rol; comprobar preview antes de
   integrar. Tras publicar, verificar el despliegue y conservar reversión por commit.

## Criterios de aceptación

- Cada rol conserva todas sus opciones, acciones, rutas y restricciones previas.
- Plegar o abrir el menú no borra formularios, filtros, selección ni resultados,
  ni añade llamadas de red o intervalos de refresco duplicados.
- NHO semanal conserva resultados y contadores; historial conserva independencia,
  autenticación, paginación y comportamiento al cerrar/reabrir.
- En datos ficticios se prueban operaciones relevantes: guardar/editar, cambios de
  estado, cargas, exportaciones y cierre de sesión según cada rol.
- Verificación visual a 390, 768 y 1440 px; zoom 200 %, teclado, foco visible y
  lector de pantalla para navegación. Sin botones tapados ni recortes de diálogos;
  scroll horizontal contenido en tablas, y scroll de Row Generator conservado.
- Contraste objetivo mínimo 4.5:1 para texto normal, 3:1 para texto grande y
  controles; verificar sobre la superficie compuesta, no solo el color CSS.
- Probar con y sin blur y movimiento reducido; comparar rendimiento en móvil
  con el diseño previo. Si el efecto entorpece scroll o interacción, reducirlo.
- Harness correcto y cero diagnósticos TypeScript nuevos. Documentar fallos previos
  por separado. No integrar si falla una comprobación necesaria de esta revisión.

## Límites del análisis

Se revisaron fuentes y estilos, no se ejecutó una auditoría visual de cada sesión
real ni se probó un rediseño. Ningún análisis garantiza riesgo cero. Quedan por
hacer el inventario detallado por rol, la preview y las pruebas de interacción.
La implementación es una fase posterior a esta solicitud de análisis.

## Ajuste necesario descubierto en validación

Staff falla antes de renderizar por `refreshing` no definido y tiene manejadores
NHO ausentes. Plan acotado: declarar el estado ya utilizado y restaurar apertura/
guardado con el mismo patrón de UserDashboard. Validar carga, apertura de detalles
y guardado contra la base ficticia; conservar consultas y permisos existentes.
