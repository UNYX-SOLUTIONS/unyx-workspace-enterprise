export const MAINTENANCE_STATUSES = [
  "Pendiente",
  "Conforme",
  "Observación",
  "No aplica",
] as const;

export interface ChecklistItem {
  id: number;
  categoria: string;
  actividad: string;
  estado: string;
  observacion: string;
}

const RAW_CHECKLIST: Array<[string, string]> = [
  ["Diagnóstico inicial", "Consultar los problemas reportados por el usuario"],
  ["Diagnóstico inicial", "Registrar el tiempo de encendido antes del mantenimiento"],
  ["Diagnóstico inicial", "Revisar el uso de CPU, memoria RAM y disco en reposo"],
  ["Diagnóstico inicial", "Confirmar la existencia de un respaldo de la información"],
  ["Almacenamiento", "Identificar si la unidad es HDD, SSD SATA o SSD NVMe"],
  ["Almacenamiento", "Revisar el estado SMART y la vida útil estimada"],
  ["Almacenamiento", "Comprobar errores o sectores defectuosos"],
  ["Almacenamiento", "Verificar temperatura y espacio disponible"],
  ["Almacenamiento", "Comprobar que TRIM esté activo en unidades SSD"],
  ["Memoria RAM", "Verificar capacidad, velocidad y reconocimiento total"],
  ["Memoria RAM", "Revisar el consumo de memoria en reposo"],
  ["Memoria RAM", "Ejecutar una prueba de errores de memoria"],
  ["Memoria RAM", "Verificar configuración Single Channel o Dual Channel"],
  ["Refrigeración", "Revisar el funcionamiento y ruido del ventilador"],
  ["Refrigeración", "Medir la temperatura del procesador en reposo"],
  ["Refrigeración", "Medir la temperatura durante una prueba de carga"],
  ["Refrigeración", "Verificar si existe reducción térmica de rendimiento"],
  ["Batería y alimentación", "Revisar el estado físico de la batería"],
  ["Batería y alimentación", "Comparar capacidad actual y capacidad de diseño"],
  ["Batería y alimentación", "Revisar ciclos de carga y porcentaje de desgaste"],
  ["Batería y alimentación", "Probar cargador, conector y estabilidad de carga"],
  ["Componentes", "Probar pantalla, brillo y estado de las bisagras"],
  ["Componentes", "Probar teclado y touchpad"],
  ["Componentes", "Probar cámara, micrófono, parlantes y audífonos"],
  ["Componentes", "Probar puertos USB, HDMI, Ethernet y lector de tarjetas"],
  ["Componentes", "Probar conexiones WiFi y Bluetooth"],
  ["Componentes", "Revisar carcasa, tornillos y patas de goma"],
  ["Limpieza física", "Limpiar carcasa, pantalla, teclado y touchpad"],
  ["Limpieza física", "Retirar polvo de ventiladores, rejillas y disipadores"],
  ["Limpieza física", "Revisar conexiones, cables y tornillos internos"],
  ["Limpieza física", "Revisar la condición de la pasta térmica"],
  ["Software", "Instalar actualizaciones pendientes del sistema operativo"],
  ["Software", "Actualizar controladores desde fuentes oficiales"],
  ["Software", "Revisar actualizaciones de BIOS o firmware"],
  ["Software", "Desinstalar programas innecesarios o duplicados"],
  ["Software", "Desactivar aplicaciones innecesarias del inicio"],
  ["Software", "Limpiar archivos temporales y liberar espacio"],
  ["Software", "Comprobar y reparar archivos del sistema"],
  ["Software", "Revisar configuración de energía y memoria virtual"],
  ["Seguridad", "Confirmar que el antivirus y el firewall estén activos"],
  ["Seguridad", "Ejecutar un análisis completo de amenazas"],
  ["Seguridad", "Revisar extensiones y aplicaciones sospechosas"],
  ["Pruebas finales", "Medir nuevamente el tiempo de encendido"],
  ["Pruebas finales", "Comparar uso de CPU, RAM y disco en reposo"],
  ["Pruebas finales", "Revisar nuevamente las temperaturas"],
  ["Pruebas finales", "Ejecutar una prueba corta de estabilidad"],
  ["Pruebas finales", "Confirmar el funcionamiento de periféricos y conexiones"],
  ["Pruebas finales", "Verificar la apertura de los programas principales"],
];

export const MAINTENANCE_CHECKLIST: ChecklistItem[] = RAW_CHECKLIST.map(
  ([categoria, actividad], index) => ({
    id: index + 1,
    categoria,
    actividad,
    estado: "Pendiente",
    observacion: "",
  })
);

export const createMaintenanceChecklist = (): ChecklistItem[] =>
  MAINTENANCE_CHECKLIST.map((item) => ({ ...item }));
