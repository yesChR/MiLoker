export const ESTADOS_INCIDENTE = {
    REPORTADO_ESTUDIANTE: 1,      // Estudiante reporta (responsable desconocido)
    REPORTADO_PROFESOR: 2,        // Profesor reporta (puede conocer responsable)
    EN_INVESTIGACION: 3,          // Profesor investigando
    RESPONSABLE_IDENTIFICADO: 4,  // Ya se sabe quién fue responsable
    RESUELTO: 5,                 // Incidente solucionado
    CERRADO: 6                   // Caso cerrado
};
