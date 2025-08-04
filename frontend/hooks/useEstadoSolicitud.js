import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { obtenerEstadoSolicitud } from "../services/solicitudService";
import { ESTADOS_SOLICITUD } from "@/components/common/estadosSolicutudes";
import { Toast } from "../components/CustomAlert";

export const useEstadoSolicitud = () => {
    const { data: session, status } = useSession();
    const [solicitudData, setSolicitudData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mapeo de estados numéricos a sus valores textuales
    const estadoMap = {
        [ESTADOS_SOLICITUD.EN_REVISION]: "revision",
        [ESTADOS_SOLICITUD.ACEPTADA]: "aceptada", 
        [ESTADOS_SOLICITUD.RECHAZADA]: "rechazada",
        [ESTADOS_SOLICITUD.EN_ESPERA]: "espera"
    };

    const cargarDatosSolicitud = async () => {
        if (status === "loading") return;
        
        if (status === "unauthenticated" || !session?.user?.id) {
            setError("No se pudo obtener la información del usuario. Por favor, inicie sesión.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const result = await obtenerEstadoSolicitud(session.user.id);
            
            if (result.error) {
                setError(result.message || "Error al obtener el estado de la solicitud");
                Toast.error("Error", result.message || "Error al obtener el estado de la solicitud");
            } else {
                // La respuesta ya viene optimizada desde el backend
                setSolicitudData(result.data);
            }
        } catch (error) {
            console.error("Error al cargar datos de solicitud:", error);
            setError("Ocurrió un error inesperado al cargar los datos");
            Toast.error("Error", "Ocurrió un error inesperado al cargar los datos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatosSolicitud();
    }, [session, status]);

    // Funciones utilitarias
    const getCurrentStep = () => {
        if (!solicitudData) return 0;
        
        switch (solicitudData.estado) {
            case ESTADOS_SOLICITUD.EN_REVISION:
                return 2; // En revisión (paso 2)
            case ESTADOS_SOLICITUD.ACEPTADA:
            case ESTADOS_SOLICITUD.RECHAZADA:
            case ESTADOS_SOLICITUD.EN_ESPERA:
                return 3; // Resultado final (paso 3)
            default:
                return 2; // Por defecto en revisión
        }
    };

    const getCasilleroAsignado = () => {
        // Ahora el casillero asignado viene directamente en la respuesta optimizada
        if (!solicitudData || solicitudData.estado !== ESTADOS_SOLICITUD.ACEPTADA) {
            return null;
        }
        
        return solicitudData.casilleroAsignado || null;
    };

    const getEstadoTexto = () => {
        return solicitudData ? estadoMap[solicitudData.estado] : null;
    };

    return {
        // Estado
        solicitudData,
        loading,
        error,
        
        // Funciones
        cargarDatosSolicitud,
        getCurrentStep,
        getCasilleroAsignado,
        getEstadoTexto,
        
        // Constantes útiles
        ESTADOS_SOLICITUD,
        estadoMap
    };
};
