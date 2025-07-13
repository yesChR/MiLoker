import * as XLSX from 'xlsx';
import { obtenerIdEspecialidad } from '../common/especialidades.js';
import { ESTADOS } from '../common/estados.js';


function limpiarCedula(cedula) {
    if (!cedula) return "";
    return cedula.toString().replace(/[-\s]/g, "").trim();
}

function generarCorreo(cedula) {
    if (!cedula) return "";
    const cedulaLimpia = cedula.toString().replace(/[-\s]/g, "").trim();
    return `${cedulaLimpia}@est.mep.go.cr`;
}

function convertirFecha(fechaExcel) {
    if (!fechaExcel) return "2005-01-01"; // Fecha por defecto si no hay fecha
    
    try {
        let fecha;
        
        // Si es un número (fecha serial de Excel)
        if (typeof fechaExcel === 'number') {
            // Convertir número serial de Excel a fecha
            const fechaBase = new Date(1899, 11, 30); // Base de Excel: 30/12/1899
            fecha = new Date(fechaBase.getTime() + fechaExcel * 24 * 60 * 60 * 1000);
        } 
        // Si es string en formato DD/MM/YYYY
        else if (typeof fechaExcel === 'string' && fechaExcel.includes('/')) {
            const partes = fechaExcel.split('/');
            if (partes.length === 3) {
                const dia = parseInt(partes[0]);
                const mes = parseInt(partes[1]) - 1; // Los meses en JS van de 0-11
                const año = parseInt(partes[2]);
                fecha = new Date(año, mes, dia);
            } else {
                throw new Error('Formato de fecha inválido');
            }
        }
        // Si es un objeto Date
        else if (fechaExcel instanceof Date) {
            fecha = fechaExcel;
        }
        // Si no se puede procesar
        else {
            throw new Error('Tipo de fecha no reconocido');
        }
        
        // Validar que la fecha sea válida
        if (isNaN(fecha.getTime())) {
            throw new Error('Fecha inválida');
        }
        
        // Convertir a formato YYYY-MM-DD
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        
        return `${año}-${mes}-${dia}`;
    } catch (error) {
        console.warn(`Error al convertir fecha "${fechaExcel}":`, error.message);
        return "2005-01-01"; // Fecha por defecto en caso de error
    }
}

export async function leerArchivoExcel(fileBuffer) {
    try {
        // Leer el archivo Excel desde el buffer
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

        // Obtener la primera hoja
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convertir a JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet, {
            range: 5, // Empezar desde la fila 6 (índice 5)
            header: 1, // Usar números de columna como encabezados
            defval: "" // Valor por defecto para celdas vacías
        });

        // Mapear los datos al formato que necesita tu aplicación
        const estudiantesData = await Promise.all(
            rawData.map(async (row, index) => {
                // Validar que la fila tenga datos
                if (!row[0] || !row[1] || !row[3]) {
                    console.warn(`Fila ${index + 6} ignorada: datos incompletos`, row);
                    return null;
                }

                // Obtener ID de especialidad de forma dinámica
                const idEspecialidad = await obtenerIdEspecialidad(row[5]);

                return {
                    cedula: limpiarCedula(row[0]), // Columna A
                    apellidoUno: row[1]?.toString().trim() || "", // Columna B
                    apellidoDos: row[2]?.toString().trim() || "", // Columna C
                    nombre: row[3]?.toString().trim() || "", // Columna D
                    seccion: row[4]?.toString().trim() || "", // Columna E
                    especialidad: row[5]?.toString().trim() || "", // Columna F

                    // Campos adicionales requeridos por tu modelo (con valores por defecto)
                    estado: ESTADOS.ACTIVO,
                    telefono: row[8]?.toString().trim() || "", // Columna G
                    correo: generarCorreo(row[0]), // Generar correo basado en cédula
                    fechaNacimiento: convertirFecha(row[6]), // Convertir fecha de nacimiento
                    idEspecialidad // ID obtenido dinámicamente
                };
            })
        );

        // Filtrar filas nulas
        return estudiantesData.filter(item => item !== null);
    } catch (error) {
        throw new Error(`Error al leer archivo Excel: ${error.message}`);
    }
}

