import { parseDate } from "@internationalized/date";

// Función para formatear fecha para mostrar con barras (DD/MM/YYYY) en campos de solo lectura
export const formatDateForDisplay = (dateString) => {
    if (!dateString || dateString.trim() === '') return '';
    
    try {
        let dateOnly;
        
        // Si es un objeto Date (instancia de Date)
        if (dateString instanceof Date) {
            dateOnly = dateString.toISOString().split('T')[0];
        } 
        // Si es una string con formato ISO o incluye 'T'
        else if (typeof dateString === 'string' && dateString.includes('T')) {
            dateOnly = dateString.split('T')[0];
        }
        // Si ya es una string en formato YYYY-MM-DD
        else if (typeof dateString === 'string') {
            dateOnly = dateString;
        } else {
            console.warn('Formato de fecha no reconocido:', dateString);
            return '';
        }
        
        // Verificar que el formato sea YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
            const [year, month, day] = dateOnly.split('-');
            return `${day}/${month}/${year}`;
        } else {
            console.warn('Formato de fecha inválido:', dateOnly);
            return '';
        }
    } catch (error) {
        console.warn('Error al formatear fecha para mostrar:', error);
        return '';
    }
};

// Función para formatear fecha del backend (YYYY-MM-DD o ISO) a parseDate
export const formatDateForInput = (dateString) => {
    if (!dateString || dateString.trim() === '') return null;
    
    // Si ya es un objeto CalendarDate, devolverlo tal como está
    if (typeof dateString === 'object' && dateString.year) {
        return dateString;
    }
    
    try {
        let dateOnly;
        
        // Si es un objeto Date (instancia de Date)
        if (dateString instanceof Date) {
            dateOnly = dateString.toISOString().split('T')[0];
        } 
        // Si es una string con formato ISO o incluye 'T'
        else if (typeof dateString === 'string' && dateString.includes('T')) {
            dateOnly = dateString.split('T')[0];
        }
        // Si ya es una string en formato YYYY-MM-DD
        else if (typeof dateString === 'string') {
            dateOnly = dateString;
        } else {
            console.warn('Formato de fecha no reconocido:', dateString);
            return null;
        }
        
        // Verificar que el formato sea YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
            return parseDate(dateOnly);
        } else {
            console.warn('Formato de fecha inválido:', dateOnly);
            return null;
        }
    } catch (error) {
        console.warn('Error al parsear fecha:', error);
        return null;
    }
};

// Función para convertir fecha de CalendarDate a string YYYY-MM-DD
export const formatDateForSubmit = (calendarDate) => {
    // Si recibimos un string ISO, convertirlo primero
    if (typeof calendarDate === 'string') {
        try {
            const dateOnly = calendarDate.split('T')[0];
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
                return dateOnly;
            }
        } catch (error) {
            console.warn('Error al procesar fecha string:', error);
            return null;
        }
    }
    
    // Si es un objeto CalendarDate
    if (!calendarDate || typeof calendarDate !== 'object' || !calendarDate.year) {
        return null;
    }
    try {
        const formatted = `${calendarDate.year}-${String(calendarDate.month).padStart(2, '0')}-${String(calendarDate.day).padStart(2, '0')}`;
        return formatted;
    } catch (error) {
        console.warn('Error al formatear fecha para envío:', error);
        return null;
    }
};

// Función para formatear fecha a texto legible (ej: "21 de noviembre de 2006")
export const formatDateToReadable = (dateString) => {
    if (!dateString) return 'Sin fecha';
    
    try {
        let date;
        
        // Si es string ISO
        if (typeof dateString === 'string') {
            date = new Date(dateString);
        }
        // Si es objeto CalendarDate
        else if (dateString.year) {
            date = new Date(dateString.year, dateString.month - 1, dateString.day);
        }
        // Si ya es Date
        else if (dateString instanceof Date) {
            date = dateString;
        } else {
            return 'Fecha inválida';
        }
        
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.warn('Error al formatear fecha a texto legible:', error);
        return 'Fecha inválida';
    }
};

// Función para verificar si una fecha es válida
export const isValidDate = (dateValue) => {
    if (!dateValue) return false;
    
    // String ISO o YYYY-MM-DD
    if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        return !isNaN(date.getTime());
    }
    
    // CalendarDate
    if (typeof dateValue === 'object' && dateValue.year) {
        return !isNaN(dateValue.year) && !isNaN(dateValue.month) && !isNaN(dateValue.day);
    }
    
    // Date object
    if (dateValue instanceof Date) {
        return !isNaN(dateValue.getTime());
    }
    
    return false;
};

// Función para formatear fecha a formato corto (DD/MM/YYYY)
export const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
        let date;
        
        // Si es un objeto Date (instancia de Date)
        if (dateString instanceof Date) {
            date = dateString;
        } 
        // Si es una string
        else if (typeof dateString === 'string') {
            date = new Date(dateString);
        }
        // Si es un objeto CalendarDate
        else if (typeof dateString === 'object' && dateString.year) {
            date = new Date(dateString.year, dateString.month - 1, dateString.day);
        }
        else {
            return 'N/A';
        }
        
        // Verificar que la fecha sea válida
        if (isNaN(date.getTime())) {
            return 'N/A';
        }
        
        // Formatear a DD/MM/YYYY
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    } catch (error) {
        console.warn('Error al formatear fecha corta:', error);
        return 'N/A';
    }
};
