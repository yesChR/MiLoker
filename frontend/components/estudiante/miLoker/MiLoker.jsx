import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import CabezeraDinamica from "../../Layout/CabeceraDinamica";
import Toast from "../../CustomAlert";
import { obtenerPeriodos, obtenerInformacionEstudiante } from "../../../services/milokerService";
import LoadingMiLoker from "./LoadingMiLoker";

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
                <LoadingMiLoker />
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
            <div className="w-full max-w-3xl p-6 bg-white shadow-lg rounded-lg border border-blue-200">
                <div>
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 text-xl">📋</span>
                        </div>
                        <h2 className="text-lg font-bold text-blue-600">Normas importantes del casillero</h2>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                        <p className="text-blue-800 font-medium">
                            📢 ¡Hola <strong>{capitalizarNombre(informacionEstudiante?.estudiante?.nombre) || capitalizarNombre(session?.user?.name)}</strong>! 🔑
                        </p>
                        <p className="text-blue-700 mt-2">
                            Para que todos podamos usar los casilleros de forma segura y ordenada, te recordamos algunas reglas importantes:
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Reglas importantes:</h3>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <span className="text-red-500 text-lg mr-3 mt-0.5">❌</span>
                                <div>
                                    <strong className="text-red-800">Uso personal únicamente:</strong>
                                    <span className="text-gray-700 ml-1">No prestes tu casillero a otras personas.</span>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <span className="text-yellow-500 text-lg mr-3 mt-0.5">🔑</span>
                                <div>
                                    <strong className="text-yellow-800">Responsabilidad de la llave:</strong>
                                    <span className="text-gray-700 ml-1">La llave o combinación es tu responsabilidad, cuídala bien.</span>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <span className="text-orange-500 text-lg mr-3 mt-0.5">🍔</span>
                                <div>
                                    <strong className="text-orange-800">Sin alimentos perecederos:</strong>
                                    <span className="text-gray-700 ml-1">No guardes comida para evitar malos olores y plagas.</span>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <span className="text-purple-500 text-lg mr-3 mt-0.5">🚫</span>
                                <div>
                                    <strong className="text-purple-800">Objetos prohibidos:</strong>
                                    <span className="text-gray-700 ml-1">Está prohibido almacenar sustancias ilegales, armas o cualquier objeto peligroso.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 border-l-4 border-green-400 p-3 mt-4 rounded-r border border-green-300">
                        <div className="flex items-center">
                            <span className="text-green-600 text-lg mr-2">😊</span>
                            <p className="text-sm">
                                <strong className="text-green-800">¡Gracias por tu colaboración!</strong> 
                                <span className="text-green-700 ml-1">Cuidemos juntos este espacio para todos.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MiLoker;