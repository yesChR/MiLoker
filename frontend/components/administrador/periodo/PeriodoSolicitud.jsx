import { useState, useEffect } from "react";
import { parseAbsoluteToLocal } from "@internationalized/date";
import CabezeraDinamica from "../../Layout/CabeceraDinamica";
import { Toast } from "../../CustomAlert";
import TarjetasPeriodo from "./TarjetasPeriodo";
import FormularioPeriodos from "./FormularioPeriodos";
import ModalRestablecer from "./ModalRestablecer";
import { 
    getEstadoPeriodos, 
    actualizarPeriodo, 
    restablecerAsignaciones,
    convertirFechaParaBD
} from "../../../services/periodoService";

const PeriodoSolicitud = () => {
    // Estados para fechas - iniciar como null para campos vacíos
    const [inicioSolicitud, setInicioSolicitud] = useState(null);
    const [finSolicitud, setFinSolicitud] = useState(null);
    const [inicioAsignacion, setInicioAsignacion] = useState(null);
    const [finAsignacion, setFinAsignacion] = useState(null);
    
    // Estados para UI
    const [showAlert, setShowAlert] = useState(false);
    const [loading, setLoading] = useState(false);
    const [periodos, setPeriodos] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Cargar datos iniciales
    useEffect(() => {
        cargarEstadoPeriodos();
    }, []);

    const cargarEstadoPeriodos = async () => {
        try {
            setLoadingData(true);
            const data = await getEstadoPeriodos();
            setPeriodos(data);
            
            // Actualizar los campos del formulario con los datos existentes
            const periodoSolicitud = data.find(p => p.tipo === 2);
            const periodoAsignacion = data.find(p => p.tipo === 1);
            
            if (periodoSolicitud) {
                setInicioSolicitud(parseAbsoluteToLocal(new Date(periodoSolicitud.fechaInicio).toISOString()));
                setFinSolicitud(parseAbsoluteToLocal(new Date(periodoSolicitud.fechaFin).toISOString()));
            }
            
            if (periodoAsignacion) {
                setInicioAsignacion(parseAbsoluteToLocal(new Date(periodoAsignacion.fechaInicio).toISOString()));
                setFinAsignacion(parseAbsoluteToLocal(new Date(periodoAsignacion.fechaFin).toISOString()));
            }
        } catch (error) {
            console.error("Error al cargar períodos:", error);
            Toast.error("Error", "No se pudieron cargar los períodos");
        } finally {
            setLoadingData(false);
        }
    };

    const handleRestablecer = () => {
        setShowAlert(true);
    };

    const handleConfirmRestablecer = async () => {
        setShowAlert(false);
        setLoading(true);
        try {
            await restablecerAsignaciones();
            Toast.success("Éxito", "Las asignaciones han sido restablecidas exitosamente");
            await cargarEstadoPeriodos(); // Recargar datos
        } catch (error) {
            console.error("Error al restablecer:", error);
            Toast.error("Error", error.message || "No se pudieron restablecer las asignaciones");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRestablecer = () => {
        setShowAlert(false);
    };

    const handleActualizar = async (e) => {
        e.preventDefault();
        
        // Validar que todas las fechas estén completas
        if (!inicioSolicitud || !finSolicitud || !inicioAsignacion || !finAsignacion) {
            Toast.error("Error", "Por favor completa todas las fechas antes de continuar");
            return;
        }
        
        setLoading(true);
        
        try {
            // Actualizar período de solicitud
            await actualizarPeriodo({
                tipo: 2, // Solicitud
                fechaInicio: convertirFechaParaBD(inicioSolicitud),
                fechaFin: convertirFechaParaBD(finSolicitud)
            });

            // Actualizar período de asignación
            await actualizarPeriodo({
                tipo: 1, // Asignación
                fechaInicio: convertirFechaParaBD(inicioAsignacion),
                fechaFin: convertirFechaParaBD(finAsignacion)
            });

            Toast.success("Éxito", "Los períodos han sido actualizados exitosamente");
            await cargarEstadoPeriodos();
        } catch (error) {
            console.error("Error al actualizar períodos:", error);
            Toast.error("Error", error.message || "No se pudieron actualizar los períodos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Períodos de solicitud"
                    breadcrumb="Home • Períodos de solicitud"
                />
            </div>

            <TarjetasPeriodo 
                periodos={periodos}
                onRestablecer={handleRestablecer}
            />

            <FormularioPeriodos
                inicioSolicitud={inicioSolicitud}
                setInicioSolicitud={setInicioSolicitud}
                finSolicitud={finSolicitud}
                setFinSolicitud={setFinSolicitud}
                inicioAsignacion={inicioAsignacion}
                setInicioAsignacion={setInicioAsignacion}
                finAsignacion={finAsignacion}
                setFinAsignacion={setFinAsignacion}
                onSubmit={handleActualizar}
                loading={loading}
                loadingData={loadingData}
            />

            <ModalRestablecer
                showAlert={showAlert}
                onConfirm={handleConfirmRestablecer}
                onCancel={handleCancelRestablecer}
            />
        </div>
    );
};

export default PeriodoSolicitud;
