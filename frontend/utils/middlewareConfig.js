// Configuración centralizada del middleware
export const MIDDLEWARE_CONFIG = {
  // URLs de la API
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  
  // Tiempos de cache para verificaciones (en milisegundos)
  CACHE_PERIODO_MS: 5 * 60 * 1000, // 5 minutos
  
  // Configuraciones de redirección
  INCLUDE_CALLBACK_URL: true,
  DEFAULT_ERROR_MESSAGE: 'acceso_denegado',
  
  // Configuraciones de logging
  ENABLE_MIDDLEWARE_LOGS: process.env.NODE_ENV === 'development',
};

// Utilidad para logging condicional
export function logMiddleware(message, ...args) {
  if (MIDDLEWARE_CONFIG.ENABLE_MIDDLEWARE_LOGS) {
    console.log(`[MIDDLEWARE] ${message}`, ...args);
  }
}

// Cache simple para períodos (evitar múltiples llamadas)
class PeriodoCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Verificar si el cache expiró
    if (Date.now() - item.timestamp > MIDDLEWARE_CONFIG.CACHE_PERIODO_MS) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

export const periodoCache = new PeriodoCache();

// Función optimizada para verificar períodos con cache
export async function verificarPeriodoConCache(tipoPeriodo) {
  const cacheKey = `periodo_${tipoPeriodo}`;
  
  // Verificar cache primero
  const cached = periodoCache.get(cacheKey);
  if (cached !== null) {
    logMiddleware(`Período ${tipoPeriodo} obtenido del cache: ${cached}`);
    return cached;
  }

  try {
    const response = await fetch(`${MIDDLEWARE_CONFIG.API_URL}/administrativo/periodo/vigente/${tipoPeriodo}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
    });



    if (!response.ok) {
      logMiddleware(`Error HTTP verificando período ${tipoPeriodo}: ${response.status}`);
      return false;
    }

    const result = await response.json();
    const isActive = result.success && result.data;
    
    // Guardar en cache
    periodoCache.set(cacheKey, isActive);
    
    logMiddleware(`Período ${tipoPeriodo} verificado desde API: ${isActive}`);
    return isActive;
  } catch (error) {
    logMiddleware(`Error verificando período ${tipoPeriodo}:`, error.message);
    // En caso de error de red, asumir que no hay período activo para mayor seguridad
    return false;
  }
}
