import { Button, DatePicker } from "@heroui/react";
import { today, getLocalTimeZone } from "@internationalized/date";

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
    loadingData
}) => {
    // Obtener la fecha actual como mínima
    const fechaActual = today(getLocalTimeZone());
    
    // Calcular fechas mínimas dinámicamente
    const fechaMinimaFinSolicitud = inicioSolicitud ? inicioSolicitud.add({ days: 1 }) : fechaActual.add({ days: 1 });
    const fechaMinimaInicioAsignacion = finSolicitud ? finSolicitud.add({ days: 1 }) : fechaActual.add({ days: 1 });
    const fechaMinimaFinAsignacion = inicioAsignacion ? inicioAsignacion.add({ days: 1 }) : fechaMinimaInicioAsignacion;

    // Función para manejar cambios en inicio de solicitud
    const handleInicioSolicitudChange = (value) => {
        setInicioSolicitud(value);
        // Si la fecha de fin de solicitud es menor o igual, ajustarla al día siguiente
        if (finSolicitud && value && finSolicitud.compare(value) <= 0) {
            setFinSolicitud(value.add({ days: 1 }));
        }
    };

    // Función para manejar cambios en fin de solicitud
    const handleFinSolicitudChange = (value) => {
        setFinSolicitud(value);
        
        if (value) {
            // Establecer automáticamente la fecha de inicio de asignación al día siguiente
            const nuevaFechaInicioAsignacion = value.add({ days: 1 });
            setInicioAsignacion(nuevaFechaInicioAsignacion);
            
            // También ajustar fin de asignación si es necesario o si no está establecido
            if (!finAsignacion || (finAsignacion && finAsignacion.compare(nuevaFechaInicioAsignacion) <= 0)) {
                setFinAsignacion(nuevaFechaInicioAsignacion.add({ days: 1 }));
            }
        }
    };

    // Función para manejar cambios en inicio de asignación
    const handleInicioAsignacionChange = (value) => {
        setInicioAsignacion(value);
        // Si la fecha de fin de asignación es menor o igual, ajustarla al día siguiente
        if (finAsignacion && value && finAsignacion.compare(value) <= 0) {
            setFinAsignacion(value.add({ days: 1 }));
        }
    };
    return (
        <form onSubmit={onSubmit} className="border-2 border-gray-200 rounded-lg p-6 bg-white w-full max-w-[600px] text-center">
            <div className="bg-primario text-white p-2 rounded-md font-bold">
                {loadingData ? "Cargando datos..." : "Fechas de períodos activos"}
            </div>
            <div className="mt-4 flex flex-col text-left">
                <label className="block font-bold text-gray-700 mb-2">Período de solicitud: <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-4 sm:flex-nowrap">
                    <div className="w-full sm:w-1/2">
                        <DatePicker
                            isRequired
                            label="Inicio"
                            labelPlacement="outside"
                            value={inicioSolicitud}
                            onChange={handleInicioSolicitudChange}
                            granularity="day"
                            className="w-full"
                            placeholder="Selecciona una fecha"
                            minValue={fechaActual}
                            isDisabled={loading || loadingData}
                        />
                    </div>
                    <div className="w-full sm:w-1/2">
                        <DatePicker
                            isRequired
                            label="Fin"
                            labelPlacement="outside"
                            value={finSolicitud}
                            onChange={handleFinSolicitudChange}
                            granularity="day"
                            className="w-full"
                            placeholder="Selecciona una fecha"
                            minValue={fechaMinimaFinSolicitud}
                            isDisabled={loading || loadingData}
                        />
                    </div>
                </div>
                <label className="block font-bold text-gray-700 mt-3 mb-2">Período de asignación: <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-4 sm:flex-nowrap">
                    <div className="w-full sm:w-1/2">
                        <DatePicker
                            isRequired
                            label="Inicio"
                            labelPlacement="outside"
                            value={inicioAsignacion}
                            onChange={handleInicioAsignacionChange}
                            granularity="day"
                            className="w-full"
                            placeholder="Selecciona una fecha"
                            minValue={fechaMinimaInicioAsignacion}
                            isDisabled={loading || loadingData}
                        />
                    </div>
                    <div className="w-full sm:w-1/2">
                        <DatePicker
                            isRequired
                            label="Fin"
                            labelPlacement="outside"
                            value={finAsignacion}
                            onChange={setFinAsignacion}
                            granularity="day"
                            className="w-full"
                            placeholder="Selecciona una fecha"
                            minValue={fechaMinimaFinAsignacion}
                            isDisabled={loading || loadingData}
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <Button 
                        type="submit" 
                        className="bg-primario text-white w-[160px]"
                        isLoading={loading}
                        disabled={loading || loadingData}
                    >
                        {loading ? "Actualizando..." : "Actualizar"}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default FormularioPeriodos;
