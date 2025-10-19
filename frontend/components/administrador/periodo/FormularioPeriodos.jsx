import { Button, DatePicker } from "@heroui/react";
import { today, getLocalTimeZone, now } from "@internationalized/date";

const FormularioPeriodos = ({ 
    inicioSolicitud, 
    setInicioSolicitud,
    finSolicitud, 
    setFinSolicitud,
    inicioAsignacion, 
    setInicioAsignacion,
    finAsignacion, 
    setFinAsignacion,
    onSubmit,
    loading,
    loadingData,
    periodos // Agregar prop para verificar períodos vencidos
}) => {
    // Obtener la fecha y hora actual + 5 minutos como mínima
    const fechaActual = now(getLocalTimeZone()).add({ minutes: 5 });
    
    // Verificar si algún período ya ha iniciado (bloquear edición)
    const verificarPeriodoIniciado = () => {
        if (!periodos || periodos.length === 0) return false;
        
        const ahora = new Date();
        return periodos.some(periodo => {
            const fechaInicio = new Date(periodo.fechaInicio);
            return fechaInicio <= ahora;
        });
    };
    
    const periodoYaIniciado = verificarPeriodoIniciado();
    
    // Calcular fechas mínimas dinámicamente (todas deben ser al menos 5 minutos desde ahora)
    const fechaMinimaFinSolicitud = inicioSolicitud ? inicioSolicitud.add({ minutes: 1 }) : fechaActual.add({ minutes: 1 });
    const fechaMinimaInicioAsignacion = finSolicitud ? finSolicitud.add({ minutes: 1 }) : fechaActual;
    const fechaMinimaFinAsignacion = inicioAsignacion ? inicioAsignacion.add({ minutes: 1 }) : fechaMinimaInicioAsignacion;

    // Función para manejar cambios en inicio de solicitud
    const handleInicioSolicitudChange = (value) => {
        setInicioSolicitud(value);
        // Si la fecha de fin de solicitud es menor o igual, ajustarla al minuto siguiente
        if (finSolicitud && value && finSolicitud.compare(value) <= 0) {
            setFinSolicitud(value.add({ minutes: 1 }));
        }
    };

    // Función para manejar cambios en fin de solicitud
    const handleFinSolicitudChange = (value) => {
        setFinSolicitud(value);
        
        if (value) {
            // Establecer automáticamente la fecha de inicio de asignación al minuto siguiente
            const nuevaFechaInicioAsignacion = value.add({ minutes: 1 });
            setInicioAsignacion(nuevaFechaInicioAsignacion);
            
            // También ajustar fin de asignación si es necesario o si no está establecido
            if (!finAsignacion || (finAsignacion && finAsignacion.compare(nuevaFechaInicioAsignacion) <= 0)) {
                setFinAsignacion(nuevaFechaInicioAsignacion.add({ minutes: 1 }));
            }
        }
    };

    // Función para manejar cambios en inicio de asignación
    const handleInicioAsignacionChange = (value) => {
        setInicioAsignacion(value);
        // Si la fecha de fin de asignación es menor o igual, ajustarla al minuto siguiente
        if (finAsignacion && value && finAsignacion.compare(value) <= 0) {
            setFinAsignacion(value.add({ minutes: 1 }));
        }
    };
    return (
        <form onSubmit={onSubmit} className="border-2 border-gray-200 rounded-lg p-6 bg-white w-full max-w-[600px] text-center">
            <div className="bg-primario text-white p-2 rounded-md font-bold">
                {loadingData ? "Cargando datos..." : "Fechas de períodos activos"}
            </div>
            
            {/* Mensaje de advertencia si el período ya inició */}
            {periodoYaIniciado && (
                <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700">
                        <strong>⚠️ Periodo Iniciado:</strong> Hay períodos que ya han iniciado. 
                        No se pueden modificar. Debe restablecer las asignaciones para configurar nuevos períodos.
                    </p>
                </div>
            )}
            
            {/* Mensaje informativo sobre fechas mínimas */}
            {!periodoYaIniciado && !loadingData && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                        <strong>Nota:</strong> Las fechas deben ser al menos 5 minutos desde el momento actual.
                    </p>
                </div>
            )}
            
            <div className="mt-4 flex flex-col text-left">
                <label className="block font-bold text-gray-700 mb-2">Período de solicitud: <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-4 sm:flex-nowrap">
                    <div className="w-full sm:w-1/2">
                        <DatePicker
                            isRequired
                            label="Fecha y hora de inicio"
                            labelPlacement="outside"
                            showMonthAndYearPickers
                            variant="bordered"
                            value={inicioSolicitud}
                            onChange={handleInicioSolicitudChange}
                            granularity="minute"
                            hourCycle={12}
                            hideTimeZone
                            className="w-full"
                            placeholder="Selecciona fecha y hora"
                            minValue={fechaActual}
                            isDisabled={loading || loadingData || periodoYaIniciado}
                            errorMessage="La fecha debe ser al menos 5 minutos desde ahora"
                            locale="es-ES"
                        />
                    </div>
                    <div className="w-full sm:w-1/2">
                        <DatePicker
                            isRequired
                            label="Fecha y hora de fin"
                            labelPlacement="outside"
                            showMonthAndYearPickers
                            variant="bordered"
                            value={finSolicitud}
                            onChange={handleFinSolicitudChange}
                            granularity="minute"
                            hourCycle={12}
                            hideTimeZone
                            className="w-full"
                            placeholder="Selecciona fecha y hora"
                            minValue={fechaMinimaFinSolicitud}
                            isDisabled={loading || loadingData || periodoYaIniciado}
                            errorMessage="Debe ser posterior a la fecha de inicio"
                            locale="es-ES"
                        />
                    </div>
                </div>
                <label className="block font-bold text-gray-700 mt-3 mb-2">Período de asignación: <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-4 sm:flex-nowrap">
                    <div className="w-full sm:w-1/2">
                        <DatePicker
                            isRequired
                            label="Fecha y hora de inicio"
                            labelPlacement="outside"
                            showMonthAndYearPickers
                            variant="bordered"
                            value={inicioAsignacion}
                            onChange={handleInicioAsignacionChange}
                            granularity="minute"
                            hourCycle={12}
                            hideTimeZone
                            className="w-full"
                            placeholder="Selecciona fecha y hora"
                            minValue={fechaMinimaInicioAsignacion}
                            isDisabled={loading || loadingData || periodoYaIniciado}
                            errorMessage="Debe ser posterior al fin del periodo de solicitud"
                            locale="es-ES"
                        />
                    </div>
                    <div className="w-full sm:w-1/2">
                        <DatePicker
                            isRequired
                            label="Fecha y hora de fin"
                            labelPlacement="outside"
                            showMonthAndYearPickers
                            variant="bordered"
                            value={finAsignacion}
                            onChange={setFinAsignacion}
                            granularity="minute"
                            hourCycle={12}
                            hideTimeZone
                            className="w-full"
                            placeholder="Selecciona fecha y hora"
                            minValue={fechaMinimaFinAsignacion}
                            isDisabled={loading || loadingData || periodoYaIniciado}
                            locale="es-ES"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <Button 
                        type="submit" 
                        className={`w-[160px] ${periodoYaIniciado ? 'bg-gray-400 cursor-not-allowed' : 'bg-primario'} text-white`}
                        isLoading={loading}
                        disabled={loading || loadingData || periodoYaIniciado}
                        title={periodoYaIniciado ? "El periodo ya inició, debe restablecer primero" : ""}
                    >
                        {loading ? "Actualizando..." : periodoYaIniciado ? "Bloqueado" : "Actualizar"}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default FormularioPeriodos;
