import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { logMiddleware, verificarPeriodoConCache, MIDDLEWARE_CONFIG } from "./utils/middlewareConfig.js";
import { ROLES } from "@/components/common/roles.js";
import { verificarAccesoService } from "./services/verificarAccesoService.js";
import { 
  RUTAS_POR_ROL, 
  esRutaPublica,
  tieneAccesoRuta,
  requierePeriodoActivo,
  requiereCasilleroAsignado
} from "./config/routeConfig.js";

const TIPOS_PERIODO = {
  ASIGNACION: 1,
  SOLICITUD: 2
};


// Función para verificar si el estudiante tiene casillero asignado
async function verificarCasilleroAsignado(pathname, token) {
  // Si la ruta no requiere casillero asignado, permitir acceso
  if (!requiereCasilleroAsignado(pathname)) {
    return { permitido: true, mensaje: null };
  }

  // Solo aplicar esta validación a estudiantes
  if (token?.role !== ROLES.ESTUDIANTE) {
    return { permitido: true, mensaje: null };
  }

  try {
    const cedulaEstudiante = token.id;
    
    // Usar el service para verificar casillero asignado
    const result = await verificarAccesoService.verificarCasilleroAsignado(cedulaEstudiante);
    
    // Si hay error en la respuesta (usando handleResponse)
    if (result.error) {
      logMiddleware(`Error verificando casillero asignado para estudiante ${cedulaEstudiante}: ${result.message}`);
      return { 
        permitido: false, 
        mensaje: 'error_verificacion'
      };
    }

    const tieneCasillero = result.success && result.data?.tieneCasillero;
    
    if (!tieneCasillero) {
      logMiddleware(`Estudiante ${cedulaEstudiante} no tiene casillero asignado para acceder a ${pathname}`);
      return { 
        permitido: false, 
        mensaje: 'sin_casillero_asignado'
      };
    }

    logMiddleware(`Estudiante ${cedulaEstudiante} tiene casillero asignado, acceso permitido a ${pathname}`);
    return { permitido: true, mensaje: null };

  } catch (error) {
    logMiddleware('Error verificando casillero asignado:', error);
    return { 
      permitido: false, 
      mensaje: 'error_verificacion'
    };
  }
}

// Función para verificar períodos activos y solicitudes existentes para estudiantes
async function verificarPeriodoActivo(pathname, token) {
  // Si la ruta no depende de períodos, permitir acceso
  if (!requierePeriodoActivo(pathname)) {
    return { permitido: true, mensaje: null };
  }

  try {
    // Determinar el tipo de período según la ruta (valores numéricos)
    let tipoPeriodo;
    if (pathname.startsWith('/estudiante/solicitudCasillero')) {
      tipoPeriodo = TIPOS_PERIODO.SOLICITUD; // Período de solicitud
    }

    if (tipoPeriodo === undefined) {
      logMiddleware(`No se pudo determinar el tipo de período para: ${pathname}`);
      return { permitido: true, mensaje: null };
    }

    // Para estudiantes accediendo a solicitud de casillero, verificar tanto período como solicitud existente
    if (pathname.startsWith('/estudiante/solicitudCasillero') && token?.role === ROLES.ESTUDIANTE) {
      // Usar el service para verificar acceso
      const cedulaEstudiante = token.id; // Asumiendo que el ID es la cédula
      
      const result = await verificarAccesoService.verificarSolicitudCasillero(cedulaEstudiante, tipoPeriodo);
      
      // Si hay error en la respuesta (usando handleResponse)
      if (result.error) {
        logMiddleware(`Error verificando acceso para estudiante ${cedulaEstudiante}: ${result.message}`);
        return { 
          permitido: false, 
          mensaje: 'error_verificacion'
        };
      }

      // Si la respuesta es exitosa pero no tiene acceso
      if (!result.success) {
        logMiddleware(`Acceso denegado para estudiante ${cedulaEstudiante}: ${result.message}`);
        
        // Determinar el tipo de mensaje según la respuesta del backend
        let tipoMensaje = 'periodo_inactivo';
        if (result.code === 'SOLICITUD_EXISTENTE') {
          tipoMensaje = 'solicitud_existente';
        } else if (result.code === 'PERIODO_INACTIVO') {
          tipoMensaje = 'periodo_inactivo';
        } else if (result.code === 'ESTUDIANTE_NO_ENCONTRADO') {
          tipoMensaje = 'error_verificacion';
        }
        
        return { 
          permitido: false, 
          mensaje: tipoMensaje
        };
      }

      logMiddleware(`Acceso permitido para estudiante ${cedulaEstudiante} a solicitud de casillero`);
      return { permitido: true, mensaje: null };
    }

    // Para otras rutas dependientes de período, solo verificar período activo
    const periodoActivo = await verificarPeriodoConCache(tipoPeriodo);
    if (!periodoActivo) {
      return { 
        permitido: false, 
        mensaje: 'periodo_inactivo'
      };
    }

    return { permitido: true, mensaje: null };
  } catch (error) {
    logMiddleware('Error verificando período:', error);
    return { 
      permitido: false, 
      mensaje: 'error_verificacion'
    };
  }
}

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    logMiddleware(`Procesando ruta: ${pathname}`);

    // Si es una ruta pública, permitir acceso
    if (esRutaPublica(pathname)) {
      logMiddleware(`Ruta pública permitida: ${pathname}`);
      return NextResponse.next();
    }

    // Si no hay token válido, redirigir inmediatamente al login
    if (!token || !token.role) {
      logMiddleware('No hay token válido, redirigiendo al login');
      const loginUrl = new URL('/auth/login', req.url);
      // Solo agregar callbackUrl si no es la raíz
      if (pathname !== '/' && MIDDLEWARE_CONFIG.INCLUDE_CALLBACK_URL) {
        loginUrl.searchParams.set('callbackUrl', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    // Verificar acceso por rol
    logMiddleware(`Verificando acceso para rol ${token.role} a ruta ${pathname}`);
    const tieneAcceso = tieneAccesoRuta(token.role, pathname);
    logMiddleware(`Rutas permitidas para rol ${token.role}:`, RUTAS_POR_ROL[token.role] || []);
    logMiddleware(`¿Tiene acceso? ${tieneAcceso}`);
    
    if (!tieneAcceso) {
      logMiddleware(`Usuario con rol ${token.role} intentó acceder a ${pathname} - ACCESO DENEGADO`);

      // Redirigir a la página principal (raíz) con mensaje de error
      const redirectUrl = new URL('/', req.url);
      redirectUrl.searchParams.set('error', MIDDLEWARE_CONFIG.DEFAULT_ERROR_MESSAGE);
      return NextResponse.redirect(redirectUrl);
    }

    // Verificar períodos activos para rutas que lo requieren
    const validacionPeriodo = await verificarPeriodoActivo(pathname, token);
    if (!validacionPeriodo.permitido) {
      logMiddleware(`Acceso denegado para ${pathname}: ${validacionPeriodo.mensaje}`);

      // Redirigir a la página principal (raíz) con mensaje específico
      const redirectUrl = new URL('/', req.url);
      redirectUrl.searchParams.set('mensaje', validacionPeriodo.mensaje);
      return NextResponse.redirect(redirectUrl);
    }

    // Verificar casillero asignado para rutas que lo requieren
    const validacionCasillero = await verificarCasilleroAsignado(pathname, token);
    if (!validacionCasillero.permitido) {
      logMiddleware(`Acceso denegado para ${pathname}: ${validacionCasillero.mensaje}`);

      // Redirigir a la página principal (raíz) con mensaje específico
      const redirectUrl = new URL('/', req.url);
      redirectUrl.searchParams.set('mensaje', validacionCasillero.mensaje);
      return NextResponse.redirect(redirectUrl);
    }

    logMiddleware(`Acceso permitido a: ${pathname}`);
    return NextResponse.next();
  },
  {
    callbacks: {
      // Esta función se ejecuta antes del middleware principal
      // Aquí verificamos si el usuario está autenticado
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Permitir rutas públicas sin token
        if (esRutaPublica(pathname)) {
          return true;
        }

        // Para rutas protegidas, requerir token válido
        const isAuthorized = !!token;
        if (!isAuthorized) {
          logMiddleware(`Token no válido para ruta protegida: ${pathname}`);
        }
        return isAuthorized;
      }
    }
  }
);

// Configuración de las rutas que deben ser protegidas
export const config = {
  matcher: [
    /*
     * Hacer match con todas las rutas excepto:
     * - api/auth/* (rutas de autenticación de NextAuth)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono del sitio)
     * - archivos estáticos con extensiones comunes
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|bmp|css|js|woff|woff2|ttf|eot|pdf|txt|xml|json)).*)',
  ],
};