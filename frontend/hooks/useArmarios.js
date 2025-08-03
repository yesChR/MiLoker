import { useState, useEffect } from "react";
import { obtenerArmariosPorEspecialidad } from "../services/armarioService";
import { Toast } from "../components/CustomAlert";
import { useSession } from "next-auth/react";

export const useArmarios = () => {
    const [especialidadId, setEspecialidadId] = useState(null);
    const { data: session, status } = useSession();
    const [armariosData, setArmariosData] = useState([]);
    const [loadingArmarios, setLoadingArmarios] = useState(true);

    useEffect(() => {
        if (status === "authenticated" && session?.user?.idEspecialidad) {
            setEspecialidadId(session.user.idEspecialidad);
            cargarArmarios(session.user.idEspecialidad);
        }
    }, [status, session]);

    const cargarArmarios = async (especialidadId) => {
        setLoadingArmarios(true);
        try {
            const result = await obtenerArmariosPorEspecialidad(especialidadId);
            if (result.error) {
                Toast.error("Error", result.message || "No se pudieron cargar los armarios");
                setArmariosData([]);
            } else {
                // Transformar datos del backend al formato esperado por el componente
                const armariosTransformados = result.map((armario, index) => ({
                    id: armario.idArmario || `Armario-${index + 1}`,
                    idArmario: armario.id,
                    filas: armario.numFilas,
                    columnas: armario.numColumnas,
                    especialidadId: armario.idEspecialidad,
                    casilleros: armario.casilleros.map(casillero => ({
                        id: casillero.idCasillero,
                        numCasillero: casillero.numCasillero,
                        estado: casillero.idEstadoCasillero,
                        descripcion: casillero.detalle || "",
                        estadoNombre: casillero.estadoCasillero?.nombre || ""
                    }))
                }));
                setArmariosData(armariosTransformados);
            }
        } catch (error) {
            Toast.error("Error", "Error al cargar los armarios");
            setArmariosData([]);
        } finally {
            setLoadingArmarios(false);
        }
    };

    const recargarArmarios = () => {
        if (especialidadId) {
            cargarArmarios(especialidadId);
        }
    };

    return { armariosData, loadingArmarios, recargarArmarios };
};
