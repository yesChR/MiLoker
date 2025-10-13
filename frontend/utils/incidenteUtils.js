/**
 * Utilidades para transformar datos de incidentes
 */

// Helper para formatear nombre completo
export const formatearNombreCompleto = (persona) => {
    if (!persona) return 'N/A';
    const { nombre, apellidoUno, apellidoDos } = persona;
    return `${nombre || ''} ${apellidoUno || ''} ${apellidoDos || ''}`.trim();
};

// Helper para obtener demandante (reportante - tipo 1)
export const obtenerDemandante = (estudiantesInvolucrados = []) => {
    const demandante = estudiantesInvolucrados.find(e => e.tipoInvolucramiento === 1);
    if (!demandante?.estudiante) return null;
    
    return {
        cedula: demandante.estudiante.cedula,
        nombre: formatearNombreCompleto(demandante.estudiante),
        seccion: demandante.seccion || 'N/A',
        telefono: demandante.estudiante.telefono || 'N/A',
        correo: demandante.estudiante.correo || 'N/A'
    };
};

// Helper para obtener responsable (tipo 2)
export const obtenerResponsable = (estudiantesInvolucrados = []) => {
    const responsable = estudiantesInvolucrados.find(e => e.tipoInvolucramiento === 2);
    if (!responsable?.estudiante) return null;
    
    return {
        cedula: responsable.estudiante.cedula,
        nombre: formatearNombreCompleto(responsable.estudiante),
        seccion: responsable.seccion || 'N/A',
        telefono: responsable.estudiante.telefono || 'N/A',
        correo: responsable.estudiante.correo || 'N/A',
        encargados: responsable.estudiante.encargados || []
    };
};

// Helper para obtener afectado (dueño del casillero - tipo 4)
export const obtenerAfectado = (estudiantesInvolucrados = []) => {
    const afectado = estudiantesInvolucrados.find(e => e.tipoInvolucramiento === 4);
    if (!afectado?.estudiante) return null;
    
    return {
        cedula: afectado.estudiante.cedula,
        nombre: formatearNombreCompleto(afectado.estudiante),
        seccion: afectado.seccion || 'N/A',
        telefono: afectado.estudiante.telefono || 'N/A',
        correo: afectado.estudiante.correo || 'N/A',
        encargados: afectado.estudiante.encargados || []
    };
};

// Helper para obtener testigos (tipo 3) - pueden ser múltiples
export const obtenerTestigos = (estudiantesInvolucrados = []) => {
    const testigos = estudiantesInvolucrados.filter(e => e.tipoInvolucramiento === 3);
    if (!testigos || testigos.length === 0) return [];
    
    return testigos.map(testigo => ({
        cedula: testigo.estudiante?.cedula || 'N/A',
        nombre: formatearNombreCompleto(testigo.estudiante),
        seccion: testigo.seccion || 'N/A',
        telefono: testigo.estudiante?.telefono || 'N/A',
        correo: testigo.estudiante?.correo || 'N/A',
        encargados: testigo.estudiante?.encargados || []
    }));
};

// Helper para obtener encargados del afectado
export const obtenerEncargadosAfectado = (estudiantesInvolucrados = []) => {
    const afectado = estudiantesInvolucrados.find(e => e.tipoInvolucramiento === 4);
    if (!afectado?.estudiante?.encargados) return [];
    
    return afectado.estudiante.encargados.map(enc => ({
        nombre: formatearNombreCompleto(enc),
        telefono: enc.telefono || 'N/A',
        parentesco: enc.parentesco || 'N/A'
    }));
};

// Helper para obtener URLs de evidencias
export const obtenerEvidencias = (incidente) => {
    if (!incidente?.incidentesXevidencia) return [];
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return incidente.incidentesXevidencia.map(rel => 
        `${API_URL}${rel.evidencia.imgUrl}`
    );
};

// Transformar incidente completo al formato usado en el componente
export const transformarIncidente = (incidente) => {
    if (!incidente) return null;

    const estudiantesInvolucrados = incidente.estudianteXincidentes || [];
    
    // El demandante es el creador del incidente
    // Si es estudiante, usar datos de la tabla Estudiante
    // Si es profesor, usar datos de la tabla Profesor
    let demandante = null;
    
    if (incidente.creadorUsuario) {
        const usuario = incidente.creadorUsuario;
        
        // Si es estudiante (rol 1) y tiene datos de estudiante
        if (usuario.rol === 1 && usuario.estudiante) {
            demandante = {
                cedula: usuario.estudiante.cedula,
                nombre: formatearNombreCompleto(usuario.estudiante),
                seccion: usuario.estudiante.seccion || 'N/A',
                telefono: usuario.estudiante.telefono || 'N/A',
                correo: usuario.estudiante.correo || 'N/A',
                rol: usuario.rol,
                encargados: usuario.estudiante.encargados || []
            };
        }
        // Si es profesor (rol 2) y tiene datos de profesor
        else if (usuario.rol === 2 && usuario.profesor) {
            demandante = {
                cedula: usuario.profesor.cedula,
                nombre: formatearNombreCompleto(usuario.profesor),
                seccion: 'N/A', // Profesores no tienen sección
                telefono: usuario.profesor.telefono || 'N/A',
                correo: usuario.profesor.correo || 'N/A',
                rol: usuario.rol,
                encargados: []
            };
        }
        // Fallback: buscar en estudianteXincidente si existe como REPORTANTE
        else {
            const reportante = estudiantesInvolucrados.find(e => e.tipoInvolucramiento === 1);
            if (reportante?.estudiante) {
                demandante = {
                    cedula: reportante.estudiante.cedula,
                    nombre: formatearNombreCompleto(reportante.estudiante),
                    seccion: reportante.seccion || 'N/A',
                    telefono: reportante.estudiante.telefono || 'N/A',
                    correo: reportante.estudiante.correo || 'N/A',
                    rol: 1,
                    encargados: reportante.estudiante.encargados || []
                };
            } else {
                // Último fallback
                demandante = {
                    cedula: usuario.cedula || 'N/A',
                    nombre: usuario.nombreUsuario || 'N/A',
                    seccion: 'N/A',
                    telefono: 'N/A',
                    correo: 'N/A',
                    rol: usuario.rol,
                    encargados: []
                };
            }
        }
    }

    return {
        // Datos básicos del incidente
        idIncidente: incidente.idIncidente,
        detalle: incidente.detalle,
        fechaCreacion: incidente.fechaCreacion,
        fechaResolucion: incidente.fechaResolucion,
        solucionPlanteada: incidente.solucionPlanteada,
        idEstadoIncidente: incidente.idEstadoIncidente,
        idCasillero: incidente.idCasillero,

        // Casillero
        casillero: incidente.casillero,

        // Creador del incidente (igual que demandante)
        creador: demandante,

        // Involucrados
        demandante: demandante, // El demandante es el creador (reportante)
        responsable: obtenerResponsable(estudiantesInvolucrados),
        afectado: obtenerAfectado(estudiantesInvolucrados),
        testigos: obtenerTestigos(estudiantesInvolucrados), // Pueden ser múltiples

        // Evidencias
        evidencia: obtenerEvidencias(incidente),

        // Historial
        historial: incidente.HistorialIncidentes || [],
        
        // Estudiantes involucrados (para la tabla completa)
        estudianteXincidentes: estudiantesInvolucrados
    };
};
