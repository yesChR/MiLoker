import jsPDF from 'jspdf';
// Importar autoTable como plugin
import autoTable from 'jspdf-autotable';

export const pdfGenerator = {
    // Generar PDF para historial de casillero
    generarPDFHistorialCasillero: (data, idCasillero) => {
        const doc = new jsPDF();
        
        // Configuración del documento
        doc.setFontSize(20);
        doc.text('Historial del Casillero', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Casillero ID: ${idCasillero}`, 20, 35);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 45);
        
        // Verificar si hay datos
        if (!data.success || !data.data || data.data.length === 0) {
            doc.text('No se encontraron registros para este casillero.', 20, 65);
            doc.save(`historial_casillero_${idCasillero}.pdf`);
            return;
        }
        
        // Preparar datos para la tabla
        const tableData = data.data.map((item, index) => [
            index + 1,
            item.estudiante?.cedula || 'N/A',
            `${item.estudiante?.nombre || ''} ${item.estudiante?.apellido || ''}`.trim() || 'N/A',
            item.estudiante?.correo || 'N/A',
            item.estudiante?.seccion || 'N/A',
            item.fechaAsignacion ? new Date(item.fechaAsignacion).toLocaleDateString('es-ES') : 'N/A'
        ]);
        
        // Crear tabla
        autoTable(doc, {
            head: [['#', 'Cédula', 'Nombre', 'Correo', 'Sección', 'Fecha Asignación']],
            body: tableData,
            startY: 55,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { top: 55 }
        });
        
        // Guardar el PDF
        doc.save(`historial_casillero_${idCasillero}.pdf`);
    },

    // Generar PDF para historial de estudiante
    generarPDFHistorialEstudiante: (data, cedula) => {
        const doc = new jsPDF();
        
        // Configuración del documento
        doc.setFontSize(20);
        doc.text('Historial del Estudiante', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Cédula del estudiante: ${cedula}`, 20, 35);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 45);
        
        if (!data.success || !data.data) {
            doc.text('No se encontraron registros para este estudiante.', 20, 65);
            doc.save(`historial_estudiante_${cedula}.pdf`);
            return;
        }
        
        let currentY = 65;
        
        // Estadísticas generales
        if (data.data.estadisticas) {
            doc.setFontSize(14);
            doc.text('Resumen Estadístico', 20, currentY);
            currentY += 15;
            
            const stats = data.data.estadisticas;
            doc.setFontSize(10);
            doc.text(`Total de casilleros asignados: ${stats.totalCasilleros}`, 25, currentY);
            doc.text(`Total de solicitudes: ${stats.totalSolicitudes}`, 25, currentY + 8);
            doc.text(`Solicitudes aprobadas: ${stats.solicitudesAprobadas}`, 25, currentY + 16);
            doc.text(`Total de incidentes: ${stats.totalIncidentes}`, 25, currentY + 24);
            currentY += 40;
        }
        
        // Historial de casilleros
        if (data.data.casilleros && data.data.casilleros.length > 0) {
            doc.setFontSize(14);
            doc.text('Historial de Casilleros', 20, currentY);
            currentY += 10;
            
            const casillerosData = data.data.casilleros.map((item, index) => [
                index + 1,
                item.casillero?.numeroSecuencia || 'N/A',
                item.fechaAsignacion ? new Date(item.fechaAsignacion).toLocaleDateString('es-ES') : 'N/A',
                item.periodo?.tipo || 'N/A',
                item.periodo?.fechaInicio ? new Date(item.periodo.fechaInicio).toLocaleDateString('es-ES') : 'N/A',
                item.periodo?.fechaFin ? new Date(item.periodo.fechaFin).toLocaleDateString('es-ES') : 'N/A'
            ]);
            
            autoTable(doc, {
                head: [['#', 'Casillero', 'Fecha Asignación', 'Período', 'Fecha Inicio', 'Fecha Fin']],
                body: casillerosData,
                startY: currentY,
                theme: 'grid',
                headStyles: { fillColor: [52, 152, 219] },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });
            
            // Calcular posición después de la tabla
            currentY = currentY + (casillerosData.length * 10) + 30;
        }
        
        // Historial de incidentes
        if (data.data.incidentes && data.data.incidentes.length > 0) {
            doc.setFontSize(14);
            doc.text('Historial de Incidentes', 20, currentY);
            currentY += 10;
            
            const incidentesData = data.data.incidentes.map((item, index) => [
                index + 1,
                item.casillero?.numeroSecuencia || 'N/A',
                item.fechaCreacion ? new Date(item.fechaCreacion).toLocaleDateString('es-ES') : 'N/A',
                item.detalle || 'N/A',
                item.fechaResolucion ? new Date(item.fechaResolucion).toLocaleDateString('es-ES') : 'Pendiente'
            ]);
            
            autoTable(doc, {
                head: [['#', 'Casillero', 'Fecha Creación', 'Detalle', 'Fecha Resolución']],
                body: incidentesData,
                startY: currentY,
                theme: 'grid',
                headStyles: { fillColor: [231, 76, 60] },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });
        }
        
        // Guardar el PDF
        doc.save(`historial_estudiante_${cedula}.pdf`);
    },

    // Generar PDF para estadísticas generales
    generarPDFEstadisticasGenerales: (data) => {
        const doc = new jsPDF();
        
        // === ENCABEZADO PROFESIONAL ===
        // Fondo del encabezado
        doc.setFillColor(41, 128, 185); // Azul
        doc.rect(0, 0, 210, 35, 'F');
        
        // Título principal
        doc.setTextColor(255, 255, 255); // Blanco
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORME ESTADISTICO DE CASILLEROS', 105, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text('Sistema MiLoker', 105, 25, { align: 'center' });
        
        // Línea decorativa
        doc.setDrawColor(46, 204, 113); // Verde
        doc.setLineWidth(2);
        doc.line(20, 40, 190, 40);
        
        // Información de generación
        doc.setTextColor(0, 0, 0); // Negro
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(`Fecha de generacion: ${fechaActual}`, 20, 50);
        
        if (!data || data.error || !data.data) {
            doc.setFontSize(14);
            doc.setTextColor(231, 76, 60); // Rojo
            doc.text('No se pudieron obtener las estadisticas', 20, 70);
            doc.save('estadisticas_casilleros.pdf');
            return;
        }
        
        let currentY = 65;
        
        // === RESUMEN GENERAL ===
        if (data.data.resumenGeneral) {
            // Título de sección
            doc.setFillColor(52, 152, 219); // Azul claro
            doc.rect(20, currentY, 170, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMEN GENERAL', 25, currentY + 7);
            
            currentY += 18;
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            
            const resumen = data.data.resumenGeneral;
            
            // Crear cuadros más grandes con mejor espaciado
            const stats = [
                { label: 'TOTAL CASILLEROS', value: resumen.total || 0, color: [52, 73, 94] },
                { label: 'DISPONIBLES', value: resumen.disponibles || 0, color: [46, 204, 113] }
            ];
            
            // Primera fila - Total y Disponibles
            stats.forEach((stat, index) => {
                const x = 20 + (index * 85);
                const y = currentY;
                
                // Cuadro más grande
                doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
                doc.rect(x, y, 80, 25, 'F');
                
                // Texto blanco centrado
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(stat.label, x + 40, y + 8, { align: 'center' });
                
                doc.setFontSize(18);
                doc.text(stat.value.toString(), x + 40, y + 20, { align: 'center' });
            });
            
            currentY += 30;
            
            // Segunda fila - Ocupados y Mantenimiento
            const stats2 = [
                { label: 'OCUPADOS', value: resumen.ocupados || 0, color: [52, 152, 219] },
                { label: 'EN MANTENIMIENTO', value: resumen.enMantenimiento || 0, color: [241, 196, 15] }
            ];
            
            stats2.forEach((stat, index) => {
                const x = 20 + (index * 85);
                const y = currentY;
                
                doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
                doc.rect(x, y, 80, 25, 'F');
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(stat.label, x + 40, y + 8, { align: 'center' });
                
                doc.setFontSize(18);
                doc.text(stat.value.toString(), x + 40, y + 20, { align: 'center' });
            });
            
            currentY += 30;
            
            // Tercera fila - Solo Dañados centrado
            const x = 20 + 42.5; // Centrado
            doc.setFillColor(231, 76, 60); // Rojo
            doc.rect(x, currentY, 80, 25, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('DANADOS', x + 40, currentY + 8, { align: 'center' });
            
            doc.setFontSize(18);
            doc.text((resumen.dañados || 0).toString(), x + 40, currentY + 20, { align: 'center' });
            
            currentY += 35;
            
            // Porcentajes
            if (resumen.porcentajes) {
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                
                doc.text('Distribucion porcentual:', 20, currentY);
                currentY += 8;
                
                doc.setFont('helvetica', 'normal');
                const porcentajes = [
                    `Disponibilidad: ${resumen.porcentajes.disponibles}%`,
                    `Ocupacion: ${resumen.porcentajes.ocupados}%`,
                    `Mantenimiento: ${resumen.porcentajes.enMantenimiento}%`,
                    `Danos: ${resumen.porcentajes.dañados}%`
                ];
                
                porcentajes.forEach((porcentaje, index) => {
                    doc.text(`• ${porcentaje}`, 25, currentY + (index * 6));
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
            doc.rect(20, currentY, 170, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('ESTADISTICAS POR ESPECIALIDAD', 25, currentY + 7);
            
            currentY += 18;
            doc.setTextColor(0, 0, 0);
            
            data.data.estadisticasPorEspecialidad.forEach((esp, index) => {
                // Fondo alternado
                const bgColor = index % 2 === 0 ? [245, 245, 245] : [255, 255, 255];
                doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
                doc.rect(20, currentY, 170, 20, 'F');
                
                // Borde
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.5);
                doc.rect(20, currentY, 170, 20);
                
                // Nombre de especialidad
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(52, 73, 94);
                doc.text(`${index + 1}. ${esp.especialidad}`, 25, currentY + 7);
                
                // Estadísticas en línea
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                
                doc.text(`Total: ${esp.total}`, 25, currentY + 15);
                doc.text(`Disponibles: ${esp.disponibles}`, 70, currentY + 15);
                doc.text(`Ocupados: ${esp.ocupados}`, 115, currentY + 15);
                doc.text(`Mantenimiento: ${esp.enMantenimiento}`, 140, currentY + 15);
                doc.text(`Danados: ${esp.dañados}`, 165, currentY + 15);
                
                currentY += 22;
            });
        }

        // === DETALLES POR ESTADO ===
        if (data.data.detallesPorEstado) {
            const detalles = data.data.detallesPorEstado;
            
            // Nueva página para detalles generales
            doc.addPage();
            currentY = 20;
            
            // === RESUMEN GENERAL DE ESTADOS ===
            doc.setFillColor(44, 62, 80); // Azul oscuro
            doc.rect(20, currentY, 170, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMEN GENERAL POR ESTADO', 25, currentY + 8);
            
            currentY += 20;
            
            // Mostrar conteo general por estado
            const estadosGenerales = [
                { key: 'disponibles', label: 'DISPONIBLES', color: [46, 204, 113], count: detalles.disponibles?.length || 0 },
                { key: 'ocupados', label: 'OCUPADOS', color: [52, 152, 219], count: detalles.ocupados?.length || 0 },
                { key: 'enMantenimiento', label: 'EN MANTENIMIENTO', color: [241, 196, 15], count: detalles.enMantenimiento?.length || 0 },
                { key: 'dañados', label: 'DANADOS', color: [231, 76, 60], count: detalles.dañados?.length || 0 }
            ];
            
            estadosGenerales.forEach((estado, index) => {
                const x = 20 + (index % 2) * 85;
                const y = currentY + Math.floor(index / 2) * 30;
                
                // Cuadro del estado
                doc.setFillColor(estado.color[0], estado.color[1], estado.color[2]);
                doc.rect(x, y, 80, 25, 'F');
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(estado.label, x + 40, y + 10, { align: 'center' });
                
                doc.setFontSize(16);
                doc.text(estado.count.toString(), x + 40, y + 20, { align: 'center' });
            });
            
            currentY += 70;
            
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
                doc.rect(20, currentY, 170, 15, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text(`ESPECIALIDAD: ${nombreEspecialidad}`, 25, currentY + 10);
                
                currentY += 25;
                
                // Resumen de la especialidad
                const totalEspecialidad = Object.values(espData).reduce((total, arr) => total + arr.length, 0);
                
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`Total de casilleros: ${totalEspecialidad}`, 25, currentY);
                
                currentY += 15;
                
                // Cuadros de resumen por estado para esta especialidad
                const estadosEsp = [
                    { key: 'disponibles', label: 'DISPONIBLES', color: [46, 204, 113] },
                    { key: 'ocupados', label: 'OCUPADOS', color: [52, 152, 219] },
                    { key: 'enMantenimiento', label: 'EN MANTENIMIENTO', color: [241, 196, 15] },
                    { key: 'dañados', label: 'DANADOS', color: [231, 76, 60] }
                ];
                
                estadosEsp.forEach((estado, index) => {
                    const count = espData[estado.key]?.length || 0;
                    const x = 20 + (index % 2) * 85;
                    const y = currentY + Math.floor(index / 2) * 25;
                    
                    doc.setFillColor(estado.color[0], estado.color[1], estado.color[2]);
                    doc.rect(x, y, 80, 20, 'F');
                    
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'bold');
                    doc.text(estado.label, x + 40, y + 8, { align: 'center' });
                    
                    doc.setFontSize(14);
                    doc.text(count.toString(), x + 40, y + 16, { align: 'center' });
                });
                
                currentY += 60;
                
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
                        doc.rect(20, currentY, 170, 10, 'F');
                        doc.setTextColor(255, 255, 255);
                        doc.setFontSize(11);
                        doc.setFont('helvetica', 'bold');
                        doc.text(`${estado.label} (${espData[estado.key].length})`, 25, currentY + 7);
                        
                        currentY += 15;
                        
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
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('TABLAS DE ASIGNACIONES ACTIVAS POR ESPECIALIDAD', 25, currentY + 8);
                
                currentY += 25;
                
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
                    doc.rect(20, currentY, 170, 10, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`${especialidad} - Asignaciones Activas (${asignaciones.length})`, 25, currentY + 7);
                    
                    currentY += 18;
                    
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
                        head: [['Casillero', 'Cedula', 'Estudiante', 'Seccion', 'Fecha Asignacion']],
                        body: datosTabla,
                        theme: 'grid',
                        headStyles: {
                            fillColor: [142, 68, 173], // Morado para especialidad
                            textColor: [255, 255, 255],
                            fontSize: 10,
                            fontStyle: 'bold'
                        },
                        bodyStyles: {
                            fontSize: 9,
                            cellPadding: 4
                        },
                        alternateRowStyles: {
                            fillColor: [248, 248, 248]
                        },
                        columnStyles: {
                            0: { cellWidth: 25, halign: 'center' },
                            1: { cellWidth: 30, halign: 'center' },
                            2: { cellWidth: 70 },
                            3: { cellWidth: 20, halign: 'center' },
                            4: { cellWidth: 25, halign: 'center' }
                        },
                        margin: { left: 20, right: 20 }
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
            doc.text('Sistema de Gestion de Casilleros MiLoker', 20, 292);
            doc.text(`Pagina ${i} de ${pageCount}`, 190, 292, { align: 'right' });
        }
        
        // Guardar el PDF
        doc.save('estadisticas_casilleros.pdf');
    }
};
