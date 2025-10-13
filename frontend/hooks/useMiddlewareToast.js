import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Toast } from '@/components/CustomAlert';

export function useMiddlewareToast() {
  const router = useRouter();

  useEffect(() => {
    const { error, mensaje: mensajeParam } = router.query;

    // Manejar mensajes de error
    if (error) {
      switch (error) {
        case 'acceso_denegado':
          Toast.error('Acceso Denegado', 'No tienes permisos para acceder a esa página.');
          break;
        case 'sesion_expirada':
          Toast.warning('Sesión Expirada', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          break;
        default:
          Toast.error('Error de Acceso', 'Ha ocurrido un error de acceso.');
      }
    }

    // Manejar mensajes informativos
    if (mensajeParam) {
      switch (mensajeParam) {
        case 'periodo_inactivo':
          Toast.warning('Período Inactivo', 'La funcionalidad solicitada no está disponible porque no hay un período activo.');
          break;
        case 'solicitud_existente':
          Toast.info('Solicitud Existente', 'Ya has realizado una solicitud de casillero en este período. Solo puedes realizar una solicitud por período.');
          break;
        case 'sin_casillero_asignado':
          Toast.warning('Sin Casillero Asignado', 'No puedes acceder a esta funcionalidad porque no tienes un casillero asignado.');
          break;
        case 'periodo_asignacion_activo':
          Toast.info('Periodo de Asignación en Curso', 'El periodo de asignación de casilleros está en curso. Podrás ver tu casillero cuando este periodo finalice.');
          break;
        case 'error_verificacion':
          Toast.error('Error de Verificación', 'No se pudo verificar el estado de tu solicitud. Inténtalo más tarde.');
          break;
        case 'login_requerido':
          Toast.info('Login Requerido', 'Debes iniciar sesión para acceder a esta funcionalidad.');
          break;
        default:
          Toast.info('Información', mensajeParam);
      }
    }

    // Limpiar parámetros de la URL después de mostrar el Toast
    if (error || mensajeParam) {
      const newQuery = { ...router.query };
      delete newQuery.error;
      delete newQuery.mensaje;
      
      router.replace({
        pathname: router.pathname,
        query: newQuery
      }, undefined, { shallow: true });
    }
  }, [router.query, router.pathname]);
}
