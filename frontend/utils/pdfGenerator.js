import jsPDF from 'jspdf';
// Importar autoTable como plugin
import autoTable from 'jspdf-autotable';

export const pdfGenerator = {
    // Generar PDF para historial de casillero
    generarPDFHistorialCasillero: (data, idCasillero) => {
        const doc = new jsPDF();
        
        // === ENCABEZADO PROFESIONAL ===
        doc.setFillColor(52, 152, 219); // Azul
        doc.rect(0, 0, 210, 35, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('HISTORIAL DEL CASILLERO', 105, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text('Sistema de Gestión de Casilleros MiLoker', 105, 25, { align: 'center' });
        
        // Línea decorativa
        doc.setDrawColor(46, 204, 113);
        doc.setLineWidth(2);
        doc.line(20, 40, 190, 40);
        
        let currentY = 50;
        
        // Verificar si hay datos válidos
        if (data.error || !data.data) {
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.setTextColor(231, 76, 60);
            doc.text('No se encontraron datos para este casillero.', 20, currentY);
            doc.save(`historial_casillero_${idCasillero}.pdf`);
            return;
        }
        
        const casilleroInfo = data.data.casillero;
        const resumen = data.data.resumen;
        const detalles = data.data.detalles;
        
        // === INFORMACIÓN DEL CASILLERO ===
        doc.setFillColor(52, 152, 219); // Azul
        doc.rect(20, currentY, 170, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMACIÓN DEL CASILLERO', 25, currentY + 8);
        
        currentY += 20;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        // Cada campo en su propia fila
        doc.setFont('helvetica', 'bold');
        doc.text('Número:', 25, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(casilleroInfo.numero, 70, currentY);
        currentY += 8;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Armario:', 25, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(casilleroInfo.armario, 70, currentY);
        currentY += 8;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Especialidad:', 25, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(casilleroInfo.especialidad, 70, currentY);
        currentY += 8;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Detalle:', 25, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(casilleroInfo.detalle, 70, currentY);
        currentY += 15;
        
        // === RESUMEN ESTADÍSTICO ===
        doc.setFillColor(155, 89, 182); // Morado
        doc.rect(20, currentY, 170, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMEN ESTADÍSTICO', 25, currentY + 8);
        
        currentY += 20;
        doc.setTextColor(0, 0, 0);
        
        // Cuadros estadísticos con espacio en el medio
        const estadisticas = [
            { label: 'ESTUDIANTES', value: resumen.totalEstudiantesQueUsaron || 0, color: [52, 152, 219] },
            { label: 'INCIDENTES', value: resumen.totalIncidentes || 0, color: [231, 76, 60] },
            { label: 'PERÍODOS', value: resumen.periodosConUso || 0, color: [46, 204, 113] },
            { label: 'ESTADO', value: 'ACTIVO', color: [241, 196, 15] }
        ];
        
        // Crear una cuadrícula 2x2 con espacio en el medio
        estadisticas.forEach((stat, index) => {
            const x = 20 + (index % 2) * 87.5;
            const y = currentY + Math.floor(index / 2) * 22;
            
            // Cuadro estadístico con separación en el medio
            doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
            doc.rect(x, y, 82.5, 20, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(stat.label, x + 41.25, y + 7, { align: 'center' });
            
            doc.setFontSize(14);
            if (stat.label === 'ESTADO') {
                doc.setFontSize(10);
                doc.text(stat.value.toString(), x + 41.25, y + 16, { align: 'center' });
            } else {
                doc.text(stat.value.toString(), x + 41.25, y + 16, { align: 'center' });
            }
        });
        
        currentY += 54;
        
        // Información adicional del resumen (INFORMACIÓN IMPORTANTE RESTAURADA)
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // Información detallada del resumen estadístico
        doc.setFont('helvetica', 'bold');
        doc.text('Información detallada:', 25, currentY);
        currentY += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.text(`• Total estudiantes que lo usaron: ${resumen.totalEstudiantesQueUsaron}`, 25, currentY);
        currentY += 6;
        doc.text(`• Total incidentes reportados: ${resumen.totalIncidentes}`, 25, currentY);
        currentY += 6;
        doc.text(`• Períodos con uso: ${resumen.periodosConUso}`, 25, currentY);
        currentY += 6;
        
        if (resumen.ultimoUso) {
            const fechaUltimoUso = new Date(resumen.ultimoUso).toLocaleDateString('es-ES');
            doc.text(`• Último uso: ${fechaUltimoUso}`, 25, currentY);
            currentY += 6;
        }
        
        currentY += 10;
        
        // === HISTORIAL DE ESTUDIANTES ===
        if (detalles.estudiantesQueUsaron && detalles.estudiantesQueUsaron.length > 0) {
            // Nueva página si es necesario
            if (currentY > 200) {
                doc.addPage();
                currentY = 20;
            }
            
            doc.setFillColor(52, 152, 219); // Azul
            doc.rect(20, currentY, 170, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`HISTORIAL DE ESTUDIANTES (${detalles.estudiantesQueUsaron.length})`, 25, currentY + 8);
            
            currentY += 20;
            
            // Preparar datos para la tabla
            const tableData = detalles.estudiantesQueUsaron.map((item, index) => [
                index + 1,
                item.estudiante?.cedula || 'N/A',
                item.estudiante?.nombreCompleto || 'N/A',
                item.estudiante?.seccion || 'N/A',
                item.fechaSolicitud ? new Date(item.fechaSolicitud).toLocaleDateString('es-ES') : 'N/A',
                item.fechaAprobacion ? new Date(item.fechaAprobacion).toLocaleDateString('es-ES') : 'N/A'
            ]);
            
            // Crear tabla con estilo profesional
            autoTable(doc, {
                head: [['#', 'Cédula', 'Estudiante', 'Sección', 'Fecha Solicitud', 'Fecha Aprobación']],
                body: tableData,
                startY: currentY,
                theme: 'grid',
                headStyles: { 
                    fillColor: [52, 152, 219],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    fontSize: 9,
                    cellPadding: 3,
                    halign: 'center'
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 25, halign: 'center' },
                    2: { cellWidth: 45, halign: 'left' },
                    3: { cellWidth: 20, halign: 'center' },
                    4: { cellWidth: 32.5, halign: 'center' },
                    5: { cellWidth: 32.5, halign: 'center' }
                },
                margin: { left: 20, right: 20 },
                tableWidth: 170
            });
            
            // Calcular nueva posición después de la tabla
            currentY = currentY + (tableData.length * 6) + 40;
        }
        
        // === HISTORIAL DE INCIDENTES ===
        if (detalles.incidentes && detalles.incidentes.length > 0) {
            // Verificar si necesitamos nueva página
            if (currentY > 180) {
                doc.addPage();
                currentY = 20;
            }
            
            doc.setFillColor(231, 76, 60); // Rojo
            doc.rect(20, currentY, 170, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`HISTORIAL DE INCIDENTES (${detalles.incidentes.length})`, 25, currentY + 8);
            
            currentY += 20;
            
            const incidentesData = detalles.incidentes.map((item, index) => [
                index + 1,
                item.detalle || 'N/A',
                item.fechaReporte ? new Date(item.fechaReporte).toLocaleDateString('es-ES') : 'N/A',
                item.estado || 'N/A',
                item.reportadoPor || 'N/A'
            ]);
            
            autoTable(doc, {
                head: [['#', 'Detalle', 'Fecha Reporte', 'Estado', 'Reportado Por']],
                body: incidentesData,
                startY: currentY,
                theme: 'grid',
                headStyles: { 
                    fillColor: [231, 76, 60],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    fontSize: 9,
                    cellPadding: 3
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 55, halign: 'left' },
                    2: { cellWidth: 35, halign: 'center' },
                    3: { cellWidth: 30, halign: 'center' },
                    4: { cellWidth: 35, halign: 'left' }
                },
                margin: { left: 20, right: 20 },
                tableWidth: 170
            });
        } else {
            // Si no hay incidentes
            if (currentY > 220) {
                doc.addPage();
                currentY = 20;
            }
            
            doc.setFillColor(46, 204, 113); // Verde
            doc.rect(20, currentY, 170, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('HISTORIAL DE INCIDENTES', 25, currentY + 8);
            
            currentY += 20;
            
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.text('Excelente estado - No hay incidentes reportados para este casillero', 25, currentY);
        }
        
        // === PIE DE PÁGINA ===
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Línea del pie
            doc.setDrawColor(52, 152, 219);
            doc.setLineWidth(1);
            doc.line(20, 285, 190, 285);
            
            // Texto del pie
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text('Sistema de Gestión de Casilleros MiLoker', 20, 292);
            doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')} - Página ${i} de ${pageCount}`, 190, 292, { align: 'right' });
        }
        
        // Guardar el PDF
        doc.save(`historial_casillero_${idCasillero}.pdf`);
    },

    // Generar PDF para historial de estudiante
    generarPDFHistorialEstudiante: (data, cedula) => {
        const doc = new jsPDF();
        
        // === ENCABEZADO PROFESIONAL ===
        doc.setFillColor(46, 204, 113); // Verde
        doc.rect(0, 0, 210, 35, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('HISTORIAL ACADÉMICO DEL ESTUDIANTE', 105, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text('Sistema de Gestión de Casilleros MiLoker', 105, 25, { align: 'center' });
        
        // Línea decorativa
        doc.setDrawColor(52, 152, 219);
        doc.setLineWidth(2);
        doc.line(20, 40, 190, 40);
        
        let currentY = 50;
        
        // Verificar si hay datos válidos
        if (!data.success || !data.data) {
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.setTextColor(231, 76, 60);
            doc.text('No se encontraron registros para este estudiante.', 20, currentY);
            doc.save(`historial_estudiante_${cedula}.pdf`);
            return;
        }
        
        // Extraer información del estudiante directamente desde la respuesta del backend
        const estudianteData = data.data.estudiante;
        const casilleros = data.data.casilleros || [];
        const solicitudes = data.data.solicitudes || [];
        const incidentes = data.data.incidentes || [];
        const statsData = data.data.estadisticas || {};
        
        // Información del estudiante desde el backend
        let estudianteInfo = {
            cedula: estudianteData?.cedula || cedula,
            especialidad: estudianteData?.especialidad?.nombre || 'N/A',
            nombreCompleto: estudianteData?.nombreCompleto || 'N/A',
            seccion: estudianteData?.seccion || 'N/A',
            correo: estudianteData?.correo || 'N/A',
            telefono: estudianteData?.telefono || 'N/A'
        };
        
        // === INFORMACIÓN DEL ESTUDIANTE ===
        doc.setFillColor(52, 152, 219); // Azul
        doc.rect(20, currentY, 170, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMACIÓN DEL ESTUDIANTE', 25, currentY + 8);
        
        currentY += 20;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        // Cada campo en su propia fila
        doc.setFont('helvetica', 'bold');
        doc.text('Cédula:', 25, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(estudianteInfo.cedula, 70, currentY);
        currentY += 8;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Nombre Completo:', 25, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(estudianteInfo.nombreCompleto, 70, currentY);
        currentY += 8;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Especialidad:', 25, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(estudianteInfo.especialidad, 70, currentY);
        currentY += 8;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Sección:', 25, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(estudianteInfo.seccion, 70, currentY);
        currentY += 8;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Teléfono:', 25, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(estudianteInfo.telefono, 70, currentY);
        currentY += 8;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Correo Electrónico:', 25, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(estudianteInfo.correo, 70, currentY);
        
        currentY += 15;
        
        // === RESUMEN ESTADÍSTICO ===
        doc.setFillColor(155, 89, 182); // Morado
        doc.rect(20, currentY, 170, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMEN ESTADÍSTICO', 25, currentY + 8);
        
        currentY += 20;
        doc.setTextColor(0, 0, 0);
        
        // Cuadros estadísticos que ocupen todo el ancho del encabezado (170px)
        const estadisticas = [
            { label: 'CASILLEROS', value: statsData?.totalCasilleros || 0, color: [52, 152, 219] },
            { label: 'SOLICITUDES', value: statsData?.totalSolicitudes || 0, color: [46, 204, 113] },
            { label: 'INCIDENTES', value: statsData?.totalIncidentes || 0, color: [231, 76, 60] },
            { label: 'APROBADAS', value: statsData?.solicitudesAprobadas || 0, color: [241, 196, 15] }
        ];
        
        // Crear una cuadrícula 2x2 con espacio en el medio
        estadisticas.forEach((stat, index) => {
            const x = 20 + (index % 2) * 87.5;  // 87.5px de separación para dejar espacio en medio
            const y = currentY + Math.floor(index / 2) * 22;
            
            // Cuadro estadístico con separación en el medio
            doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
            doc.rect(x, y, 82.5, 20, 'F');  // 82.5px de ancho cada cuadro (con gap de 5px)
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(stat.label, x + 41.25, y + 7, { align: 'center' });
            
            doc.setFontSize(14);
            doc.text(stat.value.toString(), x + 41.25, y + 16, { align: 'center' });
        });
        
        currentY += 54;  // Ajustado para el nuevo espaciado
        
        // Información adicional del resumen más compacta
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);  // Reducido el tamaño de fuente
        doc.setFont('helvetica', 'normal');
        
        // Calcular estadísticas adicionales
        const tiempoPromedioCasillero = casilleros.length > 0 ? 
            Math.round(casilleros.reduce((total, c) => {
                if (c.fechaAsignacion && c.fechaLiberacion) {
                    const inicio = new Date(c.fechaAsignacion);
                    const fin = new Date(c.fechaLiberacion);
                    return total + (fin - inicio) / (1000 * 60 * 60 * 24);
                }
                return total;
            }, 0) / casilleros.filter(c => c.fechaLiberacion).length) || 0 : 0;
        
        const incidentesResueltos = incidentes.filter(i => i.fechaResolucion).length;
        const incidentesPendientes = incidentes.length - incidentesResueltos;
        
        // Organizar información en dos columnas para mejor uso del espacio
        const leftColumnY = currentY;
        let leftY = currentY;
        let rightY = currentY;
        
        if (solicitudes.length > 0) {
            const fechas = solicitudes.map(s => new Date(s.fechaSolicitud)).filter(f => !isNaN(f));
            if (fechas.length > 0) {
                const primeraSolicitud = new Date(Math.min(...fechas)).toLocaleDateString('es-ES');
                const ultimaSolicitud = new Date(Math.max(...fechas)).toLocaleDateString('es-ES');
                doc.text(`• Primera solicitud: ${primeraSolicitud}`, 25, leftY);
                leftY += 5;
                doc.text(`• Última solicitud: ${ultimaSolicitud}`, 25, leftY);
                leftY += 5;
            }
        }
        
        if (statsData.solicitudesRechazadas) {
            doc.text(`• Solicitudes rechazadas: ${statsData.solicitudesRechazadas}`, 110, rightY);
            rightY += 5;
        }
        
        if (incidentes.length > 0) {
            doc.text(`• Incidentes resueltos: ${incidentesResueltos}`, 110, rightY);
            rightY += 5;
            doc.text(`• Incidentes pendientes: ${incidentesPendientes}`, 110, rightY);
            rightY += 5;
        }
        
        currentY = Math.max(leftY, rightY) + 10;
        
        // === HISTORIAL DE CASILLEROS ===
        if (casilleros && casilleros.length > 0) {
            // Nueva página si es necesario
            if (currentY > 200) {
                doc.addPage();
                currentY = 20;
            }
            
            doc.setFillColor(52, 152, 219); // Azul
            doc.rect(20, currentY, 170, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`HISTORIAL DE CASILLEROS (${casilleros.length})`, 25, currentY + 8);
            
            currentY += 20;
            
            // Preparar datos para la tabla con campos optimizados
            const casillerosData = casilleros.map((item, index) => [
                index + 1,
                item.casillero?.numeroSecuencia || 'N/A',
                item.fechaAsignacion ? new Date(item.fechaAsignacion).toLocaleDateString('es-ES') : 'N/A',
                item.periodo?.fechaInicio ? new Date(item.periodo.fechaInicio).toLocaleDateString('es-ES') : 'N/A',
                item.periodo?.fechaFin ? new Date(item.periodo.fechaFin).toLocaleDateString('es-ES') : 'N/A',
                item.periodo?.tipo === 1 ? 'Asignación' : 'Solicitud'
            ]);
            
            autoTable(doc, {
                head: [['#', 'Casillero', 'F. Asignación', 'F. Inicio', 'F. Fin', 'Tipo']],
                body: casillerosData,
                startY: currentY,
                theme: 'grid',
                headStyles: { 
                    fillColor: [52, 152, 219],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    fontSize: 9,
                    cellPadding: 3,
                    halign: 'center'
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                columnStyles: {
                    0: { cellWidth: 20, halign: 'center' },
                    1: { cellWidth: 30, halign: 'center' },
                    2: { cellWidth: 30, halign: 'center' },
                    3: { cellWidth: 30, halign: 'center' },
                    4: { cellWidth: 30, halign: 'center' },
                    5: { cellWidth: 30, halign: 'center' }
                },
                margin: { left: 20, right: 20 },
                tableWidth: 170
            });
            
            // Calcular nueva posición
            currentY = currentY + (casillerosData.length * 6) + 40;
        }
        
        // === HISTORIAL DE SOLICITUDES ===
        if (solicitudes && solicitudes.length > 0) {
            // Nueva página si es necesario
            if (currentY > 180) {
                doc.addPage();
                currentY = 20;
            }
            
            doc.setFillColor(241, 196, 15); // Amarillo
            doc.rect(20, currentY, 170, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`HISTORIAL DE SOLICITUDES (${solicitudes.length})`, 25, currentY + 8);
            
            currentY += 20;
            
            // Preparar datos para la tabla de solicitudes optimizada
            const solicitudesData = solicitudes.map((item, index) => [
                index + 1,
                item.fechaSolicitud ? new Date(item.fechaSolicitud).toLocaleDateString('es-ES') : 'N/A',
                item.fechaRevision ? new Date(item.fechaRevision).toLocaleDateString('es-ES') : 'Pendiente',
                item.estado === 2 ? 'Aprobada' : item.estado === 3 ? 'Rechazada' : 'Pendiente',
                // Recortar especialidad si es muy larga
                item.especialidad?.nombre ? 
                    (item.especialidad.nombre.length > 15 ? item.especialidad.nombre.substring(0, 15) + '...' : item.especialidad.nombre) : 
                    'N/A',
                // Recortar justificación si es muy larga
                item.justificacion ? 
                    (item.justificacion.length > 25 ? item.justificacion.substring(0, 25) + '...' : item.justificacion) : 
                    'Sin justificación'
            ]);
            
            autoTable(doc, {
                head: [['#', 'F. Solicitud', 'F. Revisión', 'Estado', 'Especialidad', 'Justificación']],
                body: solicitudesData,
                startY: currentY,
                theme: 'grid',
                headStyles: { 
                    fillColor: [241, 196, 15],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    fontSize: 9,
                    cellPadding: 3
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                columnStyles: {
                    0: { cellWidth: 20, halign: 'center' },
                    1: { cellWidth: 28, halign: 'center' },
                    2: { cellWidth: 28, halign: 'center' },
                    3: { cellWidth: 24, halign: 'center' },
                    4: { cellWidth: 35, halign: 'left' },
                    5: { cellWidth: 35, halign: 'left' }
                },
                margin: { left: 20, right: 20 },
                tableWidth: 170
            });
            
            currentY = currentY + (solicitudesData.length * 6) + 40;
        }
        
        // === HISTORIAL DE INCIDENTES ===
        if (incidentes && incidentes.length > 0) {
            if (currentY > 200) {
                doc.addPage();
                currentY = 20;
            }
            
            doc.setFillColor(231, 76, 60); // Rojo
            doc.rect(20, currentY, 170, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`HISTORIAL DE INCIDENTES (${incidentes.length})`, 25, currentY + 8);
            
            currentY += 20;
            
            const incidentesData = incidentes.map((item, index) => [
                index + 1,
                item.casillero?.numeroSecuencia || 'N/A',
                item.fechaCreacion ? new Date(item.fechaCreacion).toLocaleDateString('es-ES') : 'N/A',
                // Recortar detalle si es muy largo
                item.detalle ? 
                    (item.detalle.length > 30 ? item.detalle.substring(0, 30) + '...' : item.detalle) : 
                    'N/A',
                item.fechaResolucion ? 'Resuelto' : 'Pendiente',
                item.fechaResolucion ? new Date(item.fechaResolucion).toLocaleDateString('es-ES') : 'Pendiente'
            ]);
            
            autoTable(doc, {
                head: [['#', 'Casillero', 'Fecha', 'Detalle', 'Estado', 'F. Resolución']],
                body: incidentesData,
                startY: currentY,
                theme: 'grid',
                headStyles: { 
                    fillColor: [231, 76, 60],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    fontSize: 9,
                    cellPadding: 3
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                columnStyles: {
                    0: { cellWidth: 20, halign: 'center' },
                    1: { cellWidth: 28, halign: 'center' },
                    2: { cellWidth: 28, halign: 'center' },
                    3: { cellWidth: 46, halign: 'left' },
                    4: { cellWidth: 24, halign: 'center' },
                    5: { cellWidth: 24, halign: 'center' }
                },
                margin: { left: 20, right: 20 },
                tableWidth: 170
            });
        } else {
            // Si no hay incidentes
            if (currentY > 250) {
                doc.addPage();
                currentY = 20;
            }
            
            doc.setFillColor(46, 204, 113); // Verde
            doc.rect(20, currentY, 170, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('HISTORIAL DE INCIDENTES', 25, currentY + 8);
            
            currentY += 20;
            
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.text('Excelente comportamiento - No hay incidentes reportados', 25, currentY);
        }
        
        // === PIE DE PÁGINA ===
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Línea del pie
            doc.setDrawColor(46, 204, 113);
            doc.setLineWidth(1);
            doc.line(20, 285, 190, 285);
            
            // Texto del pie
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text('Sistema de Gestión de Casilleros MiLoker', 20, 292);
            doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')} - Página ${i} de ${pageCount}`, 190, 292, { align: 'right' });
        }
        
        // Guardar el PDF
        doc.save(`historial_estudiante_${cedula}.pdf`);
    },

    // Generar PDF para estadísticas generales
    generarPDFEstadisticasGenerales: (data) => {
        const doc = new jsPDF();
        
        // === ENCABEZADO PROFESIONAL ===
        doc.setFillColor(41, 128, 185); // Azul
        doc.rect(0, 0, 210, 35, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORME ESTADÍSTICO DE CASILLEROS', 105, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text('Sistema de Gestión de Casilleros MiLoker', 105, 25, { align: 'center' });
        
        // Línea decorativa
        doc.setDrawColor(46, 204, 113);
        doc.setLineWidth(2);
        doc.line(20, 40, 190, 40);
        
        let currentY = 50;
        
        // Información de generación
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(`Fecha de generación: ${fechaActual}`, 20, currentY);
        
        currentY += 15;
        
        if (!data || data.error || !data.data) {
            doc.setFontSize(14);
            doc.setTextColor(231, 76, 60);
            doc.text('No se pudieron obtener las estadísticas', 20, currentY);
            doc.save('estadisticas_casilleros.pdf');
            return;
        }
        
        // === RESUMEN GENERAL ===
        if (data.data.resumenGeneral) {
            // Título de sección
            doc.setFillColor(52, 152, 219); // Azul
            doc.rect(20, currentY, 170, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMEN GENERAL', 25, currentY + 8);
            
            currentY += 20;
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            
            const resumen = data.data.resumenGeneral;
            
            // Cuadros estadísticos con el mismo estilo que otros PDFs
            const estadisticas = [
                { label: 'TOTAL', value: resumen.total || 0, color: [52, 73, 94] },
                { label: 'DISPONIBLES', value: resumen.disponibles || 0, color: [46, 204, 113] },
                { label: 'OCUPADOS', value: resumen.ocupados || 0, color: [52, 152, 219] },
                { label: 'MANTENIMIENTO', value: resumen.enMantenimiento || 0, color: [241, 196, 15] },
                { label: 'DAÑADOS', value: resumen.dañados || 0, color: [231, 76, 60] }
            ];
            
            // Primera fila: 3 cuadros (Total, Disponibles, Ocupados)
            for (let i = 0; i < 3; i++) {
                const stat = estadisticas[i];
                const x = 20 + (i * 56.67); // 170px total / 3 = 56.67px por cuadro
                const y = currentY;
                
                // Cuadro estadístico
                doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
                doc.rect(x, y, 53.33, 20, 'F'); // 53.33px de ancho con 3.34px de separación
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text(stat.label, x + 26.67, y + 7, { align: 'center' });
                
                doc.setFontSize(14);
                doc.text(stat.value.toString(), x + 26.67, y + 16, { align: 'center' });
            }
            
            currentY += 25;
            
            // Segunda fila: 2 cuadros centrados (Mantenimiento, Dañados)
            for (let i = 3; i < 5; i++) {
                const stat = estadisticas[i];
                const x = 20 + 28.33 + ((i - 3) * 56.67); // Centrado: empezar en 48.33px
                const y = currentY;
                
                // Cuadro estadístico
                doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
                doc.rect(x, y, 53.33, 20, 'F');
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text(stat.label, x + 26.67, y + 7, { align: 'center' });
                
                doc.setFontSize(14);
                doc.text(stat.value.toString(), x + 26.67, y + 16, { align: 'center' });
            }
            
            currentY += 30;
            
            // Información detallada de porcentajes
            if (resumen.porcentajes) {
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                
                doc.text('Información detallada:', 25, currentY);
                currentY += 8;
                
                doc.setFont('helvetica', 'normal');
                const porcentajes = [
                    `• Disponibilidad: ${resumen.porcentajes.disponibles}%`,
                    `• Ocupación: ${resumen.porcentajes.ocupados}%`,
                    `• Mantenimiento: ${resumen.porcentajes.enMantenimiento}%`,
                    `• Daños: ${resumen.porcentajes.dañados}%`
                ];
                
                porcentajes.forEach((porcentaje, index) => {
                    doc.text(porcentaje, 25, currentY + (index * 6));
                });
                
                currentY += 30;
            }
        }
        
        // === ESTADÍSTICAS POR ESPECIALIDAD ===
        if (data.data.estadisticasPorEspecialidad && data.data.estadisticasPorEspecialidad.length > 0) {
            // Nueva página si es necesario
            if (currentY > 180) {
                doc.addPage();
                currentY = 20;
            }
            
            // Título de sección
            doc.setFillColor(155, 89, 182); // Morado
            doc.rect(20, currentY, 170, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`ESTADÍSTICAS POR ESPECIALIDAD (${data.data.estadisticasPorEspecialidad.length})`, 25, currentY + 8);
            
            currentY += 20;
            doc.setTextColor(0, 0, 0);
            
            // Crear tabla profesional para estadísticas por especialidad
            const especialidadData = data.data.estadisticasPorEspecialidad.map((esp, index) => [
                index + 1,
                // Recortar nombre si es muy largo
                esp.especialidad.length > 25 ? esp.especialidad.substring(0, 25) + '...' : esp.especialidad,
                esp.total || 0,
                esp.disponibles || 0,
                esp.ocupados || 0,
                esp.enMantenimiento || 0,
                esp.dañados || 0
            ]);
            
            autoTable(doc, {
                head: [['#', 'Especialidad', 'Total', 'Disp.', 'Ocup.', 'Mant.', 'Dañ.']],
                body: especialidadData,
                startY: currentY,
                theme: 'grid',
                headStyles: { 
                    fillColor: [155, 89, 182],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    fontSize: 9,
                    cellPadding: 3,
                    halign: 'center'
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 60, halign: 'left' },
                    2: { cellWidth: 19, halign: 'center' },
                    3: { cellWidth: 19, halign: 'center' },
                    4: { cellWidth: 19, halign: 'center' },
                    5: { cellWidth: 19, halign: 'center' },
                    6: { cellWidth: 19, halign: 'center' }
                },
                margin: { left: 20, right: 20 },
                tableWidth: 170
            });
            
            // Calcular nueva posición después de la tabla
            currentY = currentY + (especialidadData.length * 6) + 40;
        }

        // === DETALLES POR ESTADO ===
        if (data.data.detallesPorEstado) {
            const detalles = data.data.detallesPorEstado;
            
            // Nueva página para detalles generales
            doc.addPage();
            currentY = 20;
            
            // === RESUMEN GENERAL POR ESTADO ===
            doc.setFillColor(44, 62, 80); // Azul oscuro
            doc.rect(20, currentY, 170, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMEN GENERAL POR ESTADO', 25, currentY + 8);
            
            currentY += 20;
            
            // Mostrar conteo general por estado con el mismo estilo
            const estadosGenerales = [
                { key: 'disponibles', label: 'DISPONIBLES', color: [46, 204, 113], count: detalles.disponibles?.length || 0 },
                { key: 'ocupados', label: 'OCUPADOS', color: [52, 152, 219], count: detalles.ocupados?.length || 0 },
                { key: 'enMantenimiento', label: 'MANTENIMIENTO', color: [241, 196, 15], count: detalles.enMantenimiento?.length || 0 },
                { key: 'dañados', label: 'DAÑADOS', color: [231, 76, 60], count: detalles.dañados?.length || 0 }
            ];
            
            // Crear una cuadrícula 2x2 con espacio en el medio
            estadosGenerales.forEach((estado, index) => {
                const x = 20 + (index % 2) * 87.5;
                const y = currentY + Math.floor(index / 2) * 22;
                
                // Cuadro del estado con separación en el medio
                doc.setFillColor(estado.color[0], estado.color[1], estado.color[2]);
                doc.rect(x, y, 82.5, 20, 'F');
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text(estado.label, x + 41.25, y + 7, { align: 'center' });
                
                doc.setFontSize(14);
                doc.text(estado.count.toString(), x + 41.25, y + 16, { align: 'center' });
            });
            
            currentY += 54;
            
            // === DETALLES POR ESPECIALIDAD ===
            // Agrupar casilleros por especialidad primero
            const especialidades = {};
            
            // Procesar todos los estados y agrupar por especialidad
            Object.keys(detalles).forEach(estado => {
                if (detalles[estado] && Array.isArray(detalles[estado])) {
                    detalles[estado].forEach(casillero => {
                        const esp = casillero.especialidad;
                        if (!especialidades[esp]) {
                            especialidades[esp] = {
                                disponibles: [],
                                ocupados: [],
                                enMantenimiento: [],
                                dañados: []
                            };
                        }
                        especialidades[esp][estado].push(casillero);
                    });
                }
            });
            
            // Mostrar cada especialidad en páginas separadas
            Object.keys(especialidades).sort().forEach((nombreEspecialidad, espIndex) => {
                const espData = especialidades[nombreEspecialidad];
                
                // Nueva página para cada especialidad
                doc.addPage();
                currentY = 20;
                
                // Encabezado de especialidad
                doc.setFillColor(142, 68, 173); // Morado
                doc.rect(20, currentY, 170, 12, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`ESPECIALIDAD: ${nombreEspecialidad}`, 25, currentY + 8);
                
                currentY += 20;
                
                // Resumen de la especialidad
                const totalEspecialidad = Object.values(espData).reduce((total, arr) => total + arr.length, 0);
                
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(`Total de casilleros: ${totalEspecialidad}`, 25, currentY);
                
                currentY += 15;
                
                // Cuadros de resumen por estado para esta especialidad con el nuevo estilo
                const estadosEsp = [
                    { key: 'disponibles', label: 'DISPONIBLES', color: [46, 204, 113] },
                    { key: 'ocupados', label: 'OCUPADOS', color: [52, 152, 219] },
                    { key: 'enMantenimiento', label: 'MANTENIMIENTO', color: [241, 196, 15] },
                    { key: 'dañados', label: 'DAÑADOS', color: [231, 76, 60] }
                ];
                
                // Crear una cuadrícula 2x2 con espacio en el medio
                estadosEsp.forEach((estado, index) => {
                    const count = espData[estado.key]?.length || 0;
                    const x = 20 + (index % 2) * 87.5;
                    const y = currentY + Math.floor(index / 2) * 22;
                    
                    doc.setFillColor(estado.color[0], estado.color[1], estado.color[2]);
                    doc.rect(x, y, 82.5, 20, 'F');
                    
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'bold');
                    doc.text(estado.label, x + 41.25, y + 7, { align: 'center' });
                    
                    doc.setFontSize(14);
                    doc.text(count.toString(), x + 41.25, y + 16, { align: 'center' });
                });
                
                currentY += 54;
                
                // Detalles de casilleros por estado para esta especialidad
                estadosEsp.forEach(estado => {
                    if (espData[estado.key] && espData[estado.key].length > 0) {
                        // Verificar espacio en página
                        if (currentY > 230) {
                            doc.addPage();
                            currentY = 20;
                        }
                        
                        // Encabezado del estado
                        doc.setFillColor(estado.color[0], estado.color[1], estado.color[2]);
                        doc.rect(20, currentY, 170, 12, 'F');
                        doc.setTextColor(255, 255, 255);
                        doc.setFontSize(11);
                        doc.setFont('helvetica', 'bold');
                        doc.text(`${estado.label} (${espData[estado.key].length})`, 25, currentY + 8);
                        
                        currentY += 18;
                        
                        // Agrupar por armario
                        const porArmario = {};
                        espData[estado.key].forEach(casillero => {
                            if (!porArmario[casillero.armario]) {
                                porArmario[casillero.armario] = [];
                            }
                            porArmario[casillero.armario].push(casillero);
                        });
                        
                        // Mostrar por armario
                        Object.keys(porArmario).sort().forEach(armario => {
                            // Verificar espacio
                            if (currentY > 260) {
                                doc.addPage();
                                currentY = 20;
                            }
                            
                            // Encabezado del armario
                            doc.setTextColor(0, 0, 0);
                            doc.setFillColor(240, 240, 240);
                            doc.rect(20, currentY, 170, 8, 'F');
                            doc.setFontSize(10);
                            doc.setFont('helvetica', 'bold');
                            doc.text(`Armario ${armario}`, 25, currentY + 6);
                            
                            currentY += 12;
                            
                            // Casilleros del armario
                            const casilleros = porArmario[armario].sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
                            
                            // Si son casilleros ocupados, mostrar detalles del estudiante
                            if (estado.key === 'ocupados') {
                                casilleros.forEach(casillero => {
                                    doc.setFont('helvetica', 'normal');
                                    doc.setFontSize(9);
                                    
                                    let linea = `• Casillero #${casillero.numero}`;
                                    if (casillero.estudianteAsignado) {
                                        linea += ` - ${casillero.estudianteAsignado.nombre}`;
                                        linea += ` (${casillero.estudianteAsignado.cedula})`;
                                        linea += ` - Seccion: ${casillero.estudianteAsignado.seccion}`;
                                    }
                                    
                                    doc.text(linea, 25, currentY);
                                    currentY += 5;
                                    
                                    if (casillero.estudianteAsignado?.fechaAsignacion) {
                                        const fecha = new Date(casillero.estudianteAsignado.fechaAsignacion).toLocaleDateString('es-ES');
                                        doc.setFontSize(8);
                                        doc.setTextColor(100, 100, 100);
                                        doc.text(`  Asignado: ${fecha}`, 25, currentY);
                                        doc.setTextColor(0, 0, 0);
                                        currentY += 5;
                                    }
                                    
                                    currentY += 2;
                                });
                            } else {
                                // Para otros estados, mostrar de forma compacta
                                const casillerosTexto = casilleros.map(c => {
                                    let texto = `#${c.numero}`;
                                    if (c.detalle && c.detalle !== 'Sin detalle') {
                                        texto += ` (${c.detalle})`;
                                    }
                                    return texto;
                                });
                                
                                // Dividir en líneas
                                let lineaActual = '';
                                doc.setFont('helvetica', 'normal');
                                doc.setFontSize(9);
                                
                                casillerosTexto.forEach((casilleroTexto, index) => {
                                    const textoPrueba = lineaActual + (lineaActual ? ', ' : '') + casilleroTexto;
                                    const anchoTexto = doc.getTextWidth(textoPrueba);
                                    
                                    if (anchoTexto > 160 && lineaActual) {
                                        doc.text(`• ${lineaActual}`, 25, currentY);
                                        currentY += 5;
                                        lineaActual = casilleroTexto;
                                    } else {
                                        lineaActual = textoPrueba;
                                    }
                                    
                                    if (index === casillerosTexto.length - 1 && lineaActual) {
                                        doc.text(`• ${lineaActual}`, 25, currentY);
                                        currentY += 5;
                                    }
                                });
                            }
                            
                            currentY += 5;
                        });
                        
                        currentY += 10;
                    }
                });
            });
            
            // Tablas de asignaciones activas por especialidad
            if (detalles.ocupados && detalles.ocupados.some(c => c.estudianteAsignado)) {
                doc.addPage();
                currentY = 20;
                
                // Título principal
                doc.setFillColor(52, 152, 219);
                doc.rect(20, currentY, 170, 12, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('TABLAS DE ASIGNACIONES ACTIVAS POR ESPECIALIDAD', 25, currentY + 8);
                
                currentY += 20;
                
                // Agrupar asignaciones por especialidad
                const asignacionesPorEspecialidad = {};
                detalles.ocupados
                    .filter(c => c.estudianteAsignado)
                    .forEach(c => {
                        const esp = c.especialidad;
                        if (!asignacionesPorEspecialidad[esp]) {
                            asignacionesPorEspecialidad[esp] = [];
                        }
                        asignacionesPorEspecialidad[esp].push(c);
                    });
                
                // Crear tabla para cada especialidad
                Object.keys(asignacionesPorEspecialidad).sort().forEach((especialidad, index) => {
                    const asignaciones = asignacionesPorEspecialidad[especialidad];
                    
                    // Verificar espacio para nueva tabla
                    if (currentY > 200 || index > 0) {
                        if (index > 0) doc.addPage();
                        currentY = 20;
                    }
                    
                    // Encabezado de la especialidad
                    doc.setFillColor(142, 68, 173); // Morado
                    doc.rect(20, currentY, 170, 12, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`${especialidad} - Asignaciones Activas (${asignaciones.length})`, 25, currentY + 8);
                    
                    currentY += 20;
                    
                    // Preparar datos para la tabla de esta especialidad
                    const datosTabla = asignaciones.map(c => [
                        `${c.armario}-${c.numero}`,
                        c.estudianteAsignado.cedula,
                        c.estudianteAsignado.nombre,
                        c.estudianteAsignado.seccion,
                        new Date(c.estudianteAsignado.fechaAsignacion).toLocaleDateString('es-ES')
                    ]);
                    
                    // Crear tabla para esta especialidad
                    autoTable(doc, {
                        startY: currentY,
                        head: [['Casillero', 'Cédula', 'Estudiante', 'Sección', 'Fecha Asignación']],
                        body: datosTabla,
                        theme: 'grid',
                        headStyles: {
                            fillColor: [142, 68, 173], // Morado para especialidad
                            textColor: [255, 255, 255],
                            fontSize: 10,
                            fontStyle: 'bold',
                            halign: 'center'
                        },
                        bodyStyles: {
                            fontSize: 9,
                            cellPadding: 3,
                            halign: 'center'
                        },
                        alternateRowStyles: {
                            fillColor: [248, 248, 248]
                        },
                        columnStyles: {
                            0: { cellWidth: 30, halign: 'center' },
                            1: { cellWidth: 30, halign: 'center' },
                            2: { cellWidth: 60, halign: 'left' },
                            3: { cellWidth: 25, halign: 'center' },
                            4: { cellWidth: 25, halign: 'center' }
                        },
                        margin: { left: 20, right: 20 },
                        tableWidth: 170
                    });
                    
                    // Calcular nueva posición después de la tabla
                    currentY = currentY + (datosTabla.length * 8) + 35;
                    
                    // Agregar estadísticas rápidas de la especialidad
                    doc.setTextColor(100, 100, 100);
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'italic');
                    
                    // Contar secciones únicas
                    const seccionesUnicas = [...new Set(asignaciones.map(c => c.estudianteAsignado.seccion))];
                    doc.text(`• Total estudiantes: ${asignaciones.length} | Secciones: ${seccionesUnicas.join(', ')}`, 25, currentY);
                    
                    currentY += 15;
                });
                
                // Resumen final en la última página
                doc.setTextColor(0, 0, 0);
                doc.setFillColor(44, 62, 80);
                doc.rect(20, currentY, 170, 8, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text('RESUMEN TOTAL DE ASIGNACIONES', 25, currentY + 6);
                
                currentY += 15;
                
                // Contar totales por especialidad
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                
                const totalGeneral = Object.values(asignacionesPorEspecialidad).reduce((total, arr) => total + arr.length, 0);
                doc.text(`Total general de asignaciones activas: ${totalGeneral}`, 25, currentY);
                currentY += 6;
                
                Object.keys(asignacionesPorEspecialidad).sort().forEach(esp => {
                    const count = asignacionesPorEspecialidad[esp].length;
                    const porcentaje = ((count / totalGeneral) * 100).toFixed(1);
                    doc.text(`• ${esp}: ${count} asignaciones (${porcentaje}%)`, 25, currentY);
                    currentY += 6;
                });
            }
        }
        
        // === PIE DE PÁGINA ===
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Línea del pie
            doc.setDrawColor(41, 128, 185);
            doc.setLineWidth(1);
            doc.line(20, 285, 190, 285);
            
            // Texto del pie
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text('Sistema de Gestión de Casilleros MiLoker', 20, 292);
            doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')} - Página ${i} de ${pageCount}`, 190, 292, { align: 'right' });
        }
        
        // Guardar el PDF
        doc.save('estadisticas_casilleros.pdf');
    }
};
