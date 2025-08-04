import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { crearSolicitud } from "../services/solicitudService";
import { getPeriodoActivo } from "../services/periodoService";
import { Toast } from "../components/CustomAlert";
import { ESTADOS_SOLICITUD } from "@/components/common/estadosSolicutudes";

export const useSolicitudCasillero = () => {
    const { data: session, status } = useSession();
    const [selectedCasilleros, setSelectedCasilleros] = useState([]);
    const [especialidadId, setEspecialidadId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && session?.user?.idEspecialidad) {
            setEspecialidadId(session.user.idEspecialidad);
        }
    }, [status, session]);

    const handleCasilleroClick = (casillero, armarioActual) => {
        if (casillero.estado !== 1) return; // Solo se pueden seleccionar casilleros disponibles

        // Si ya está seleccionado, lo deseleccionamos
        if (selectedCasilleros.some((item) => item.id === casillero.id && item.armarioId === armarioActual.idArmario)) {
            setSelectedCasilleros((prev) =>
                prev.filter((item) => !(item.id === casillero.id && item.armarioId === armarioActual.idArmario))
            );
        } else {
            // Si no está seleccionado, lo agregamos (máximo 2)
            if (selectedCasilleros.length < 2) {
                setSelectedCasilleros((prev) => [
                    ...prev,
                    {
                        ...casillero,
                        armarioId: armarioActual.idArmario,
                        armarioNombre: armarioActual.id
                    },
                ]);
            }
        }
    };

    const handleEnviarSolicitud = () => {
        if (!session?.user?.id) {
            Toast.error("Error", "No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.");
            return;
        }

        if (selectedCasilleros.length !== 2) {
            Toast.error("Error", "Debe seleccionar exactamente 2 casilleros");
            return;
        }

        setShowAlert(true);
    };

    const confirmarEnvioSolicitud = async () => {
        setLoading(true);
        setShowAlert(false);

        try {
            // Obtener el período activo de solicitudes (tipo 2)
            const periodoResult = await getPeriodoActivo(2);

            if (periodoResult.error) {
                Toast.error("Error", "No hay un período de solicitudes activo en este momento");
                setLoading(false);
                return;
            }

            // Preparar datos para enviar al backend
            const solicitudData = {
                cedula: session.user.id,
                estado: ESTADOS_SOLICITUD.EN_REVISION,
                idPeriodo: periodoResult.idPeriodo,
                idEspecialidad: especialidadId,
                opciones: selectedCasilleros.map((casillero, index) => ({
                    idCasillero: casillero.id,
                    detalle: index === 0 ? "Opción 1" : "Opción 2",
                    estado: ESTADOS_SOLICITUD.EN_REVISION
                }))
            };

            // Enviar solicitud al backend
            const result = await crearSolicitud(solicitudData);

            if (result.error) {
                Toast.error("Error", result.message || "Error al crear la solicitud");
            } else {
                Toast.success("Éxito", "Solicitud de casillero enviada exitosamente");
                setSelectedCasilleros([]);
            }
        } catch (error) {
            console.error("Error al enviar solicitud:", error);
            Toast.error("Error", "Ocurrió un error inesperado al enviar la solicitud");
        } finally {
            setLoading(false);
        }
    };

    return {
        selectedCasilleros,
        loading,
        showAlert,
        setShowAlert,
        handleCasilleroClick,
        handleEnviarSolicitud,
        confirmarEnvioSolicitud
    };
};
