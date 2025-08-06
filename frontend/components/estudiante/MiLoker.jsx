import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import Toast from "../CustomAlert";
import { obtenerPeriodos, obtenerInformacionEstudiante } from "../../services/milokerService";

const MiLoker = () => {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [periodos, setPeriodos] = useState({ solicitud: null, asignacion: null });
    const [informacionEstudiante, setInformacionEstudiante] = useState(null);

    // Función para formatear fechas
    const formatearFecha = (fecha) => {
        if (!fecha) return "No definido";
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Función para capitalizar nombre
    const capitalizarNombre = (nombre) => {
        if (!nombre) return "Estudiante";
        return nombre
            .toLowerCase()
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
            .join(' ');
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        const cargarDatos = async () => {
            if (status === "loading") return;
            
            if (!session?.user?.id) {
                Toast.error("Error de sesión", "No se pudo obtener la información del usuario");
                setLoading(false);
                return;
            }

            try {
                // Cargar periodos
                const responsePeriodos = await obtenerPeriodos();
                if (responsePeriodos.error) {
                    Toast.error("Error al cargar periodos", responsePeriodos.message);
                } else {
                    setPeriodos({
                        solicitud: responsePeriodos.data.periodoSolicitud,
                        asignacion: responsePeriodos.data.periodoAsignacion
                    });
                }

                // Cargar información del estudiante
                const responseInfo = await obtenerInformacionEstudiante(session.user.id);
                console.log('=== DEBUG FRONTEND ===');
                console.log('Response completa:', responseInfo);
                console.log('¿Tiene error?:', responseInfo.error);
                if (!responseInfo.error && responseInfo.data) {
                    console.log('Datos del estudiante:', responseInfo.data);
                    console.log('¿Tiene casillero?:', !!responseInfo.data.casillero);
                    console.log('¿Tiene armario?:', !!responseInfo.data.armario);
                    if (responseInfo.data.casillero) {
                        console.log('Casillero numero:', responseInfo.data.casillero.numero);
                    }
                    if (responseInfo.data.armario) {
                        console.log('Armario codigo:', responseInfo.data.armario.codigo);
                    }
                }
                
                if (responseInfo.error) {
                    Toast.error("Error al cargar información", responseInfo.message);
                } else {
                    setInformacionEstudiante(responseInfo.data);
                }

            } catch (error) {
                console.error("Error al cargar datos:", error);
                Toast.error("Error de conexión", "Error al cargar la información");
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [session, status]);

    // Generar tarjetas dinámicamente
    const tarjetas = [
        {
            titulo: "Periodo solicitud",
            fechas: periodos.solicitud 
                ? `${formatearFecha(periodos.solicitud.fechaInicio)} a ${formatearFecha(periodos.solicitud.fechaFin)}`
                : "No disponible",
            color: "bg-gradient-to-br from-purple-400 to-purple-600 text-white",
        },
        {
            titulo: "Periodo asignación",
            fechas: periodos.asignacion 
                ? `${formatearFecha(periodos.asignacion.fechaInicio)} a ${formatearFecha(periodos.asignacion.fechaFin)}`
                : "No disponible",
            color: "bg-danger text-white",
        },
        {
            titulo: "Casillero asignado",
            detalles: informacionEstudiante?.casillero 
                ? `Armario: ${informacionEstudiante.armario.codigo} - Casillero: ${informacionEstudiante.casillero.numero}`
                : "Sin casillero asignado",
            color: "bg-gradient-to-br from-yellow-400 to-orange-500 text-white",
        },
        {
            titulo: "Estado Actual",
            detalles: informacionEstudiante?.estado || "Cargando...",
            color: "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
        },
    ];

    // Mostrar loading mientras cargan los datos
    if (loading || status === "loading") {
        return (
            <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8 px-4">
                <div className="w-full">
                    <CabezeraDinamica
                        title="Mi loker"
                        breadcrumb="Inicio • Mi Loker"
                    />
                </div>
                <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-lg border border-gray-200">
                    <div className="flex justify-center items-center h-32">
                        <div className="text-lg">Cargando información...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8 px-4">
            <div className="w-full">
                <CabezeraDinamica
                    title="Mi loker"
                    breadcrumb="Inicio • Mi Loker"
                />
            </div>

            {/* Tarjetas dinámicas */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
                {tarjetas.map((tarjeta, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg shadow-md border border-gray-200 ${tarjeta.color}`}
                    >
                        <h3 className="text-lg font-bold text-white text-center">{tarjeta.titulo}</h3>
                        {tarjeta.fechas && (
                            <p className="text-sm text-gray-100 mt-2 text-center">{tarjeta.fechas}</p>
                        )}
                        {tarjeta.detalles && (
                            <p className="text-sm text-gray-100 mt-2 text-center">{tarjeta.detalles}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Normas del casillero */}
            <div className="w-full max-w-3xl p-6 bg-white shadow-lg rounded-lg border border-gray-200">
                <div>
                    <h2 className="text-lg font-bold text-rose-500">Importante</h2>
                    <p className="mt-4">📢¡Recuerda las normas de tu casillero!🔑</p>
                    <p className="mt-4">
                        Hola <strong>{capitalizarNombre(informacionEstudiante?.estudiante?.nombre) || capitalizarNombre(session?.user?.name)}</strong>,
                    </p>
                    <p className="mt-4">
                        Para que todos podamos usar los casilleros de forma segura y ordenada, te
                        recordamos algunas reglas importantes:
                    </p>
                    <ul className="mt-2 ml-4">
                        <li>❌No prestes tu casillero a otras personas. Es de uso personal.</li>
                        <li>🔑La llave o combinación es tu responsabilidad, cuídala bien.</li>
                        <li>🍔No guardes alimentos perecederos para evitar malos olores y plagas.</li>
                        <li>
                            🚫Está prohibido almacenar sustancias ilegales, armas o cualquier objeto
                            peligroso.
                        </li>
                    </ul>
                    <p className="mt-4">
                        ¡Cuidemos juntos este espacio!😊
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MiLoker;