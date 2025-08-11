import { ROLES } from "@/components/common/roles.js";

// Definición de rutas por rol
export const RUTAS_POR_ROL = {
  [ROLES.ADMINISTRADOR]: [
    '/', // Página de bienvenida
    '/administrador',
    '/administrador/admin',
    '/administrador/docentes',
    '/administrador/especialidades',
    '/administrador/estudiantes',
    '/administrador/periodoSolicitud',
    '/administrador/tiposSanciones',
    '/casillero',
    '/casillero/armario',
    '/informe',
    '/informe/informes',
  ],
  [ROLES.PROFESOR]: [
    '/', // Página de bienvenida
    '/docente',
    '/docente/alertaIncidentes',
    '/docente/crearUsuarios',
    '/docente/solicitudes',
    '/incidente',
    '/incidente/listaIncidentes',
    '/casillero',
    '/casillero/armario',
    '/informe',
    '/informe/informes',
  ],
  [ROLES.ESTUDIANTE]: [
    '/', // Página de bienvenida
    '/estudiante',
    '/estudiante/estadoSolicitud',
    '/estudiante/miLoker',
    '/estudiante/renunciarCasillero',
    '/estudiante/solicitudCasillero',
    '/incidente',
    '/incidente/listaIncidentes'
  ]
};

// Rutas que requieren períodos activos
export const RUTAS_DEPENDIENTES_PERIODO = [
  '/estudiante/solicitudCasillero',
  '/estudiante/estadoSolicitud',
];

// Rutas que requieren validación de casillero asignado
export const RUTAS_REQUIEREN_CASILLERO = [
  '/estudiante/renunciarCasillero',
  '/estudiante/miLoker'
];

// Rutas públicas que no requieren autenticación
export const RUTAS_PUBLICAS = [
  '/auth/login',
  '/auth/recuperar-contrasenna',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/public'
];

// Función helper para verificar si una ruta es pública
export function esRutaPublica(pathname) {
  return RUTAS_PUBLICAS.some(ruta => pathname.startsWith(ruta));
}

// Función helper para verificar si el usuario tiene acceso a la ruta
export function tieneAccesoRuta(userRole, pathname) {
  const rutasPermitidas = RUTAS_POR_ROL[userRole] || [];
  
  // Verificación especial para la raíz exacta
  if (pathname === '/') {
    return rutasPermitidas.includes('/');
  }
  
  // Para otras rutas, verificar que empiece con alguna ruta permitida (excluyendo la raíz)
  const rutasEspecificas = rutasPermitidas.filter(ruta => ruta !== '/');
  return rutasEspecificas.some(ruta => pathname.startsWith(ruta));
}

// Función helper para obtener las rutas permitidas por rol
export function obtenerRutasPermitidas(userRole) {
  return RUTAS_POR_ROL[userRole] || [];
}

// Función helper para verificar si una ruta requiere período activo
export function requierePeriodoActivo(pathname) {
  return RUTAS_DEPENDIENTES_PERIODO.some(ruta => pathname.startsWith(ruta));
}

// Función helper para verificar si una ruta requiere casillero asignado
export function requiereCasilleroAsignado(pathname) {
  return RUTAS_REQUIEREN_CASILLERO.some(ruta => pathname.startsWith(ruta));
}
