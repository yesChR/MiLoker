import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import ConfirmModal from "../ConfirmModal";
import { obtenerCasilleroEstudiante, renunciarCasillero } from "../../services/renunciaService";
import Toast from "../CustomAlert";

const RenunciarCasillero = () => {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [casilleroData, setCasilleroData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [processingRenuncia, setProcessingRenuncia] = useState(false);

    // Función para capitalizar el nombre
    const capitalizarNombre = (nombre) => {
        if (!nombre) return "Estudiante";
        return nombre
            .toLowerCase()
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
            .join(' ');
    };

    // Cargar datos del casillero al montar el componente
    useEffect(() => {
        const cargarDatosCasillero = async () => {
            if (status === "loading") return; // Esperar a que cargue la sesión
            
            console.log('=== DEBUG COMPONENTE ===');
            console.log('Status de sesión:', status);
            console.log('Sesión completa:', session);
            console.log('ID del usuario (cédula):', session?.user?.id);
            
            if (!session?.user?.id) {
                console.log('No hay ID (cédula) en la sesión');
                Toast.error("Error de sesión", "No se pudo obtener la información del usuario");
                setLoading(false);
                return;
            }

            try {
                console.log('Llamando al servicio con cédula:', session.user.id);
                const response = await obtenerCasilleroEstudiante(session.user.id);
                
                console.log('Respuesta del servicio:', response);
                
                if (response.error) {
                    console.log('La respuesta tiene error:', response.message);
                    Toast.error("Error al cargar casillero", response.message);
                    setCasilleroData(null);
                } else {
                    console.log('Datos del casillero obtenidos:', response.data);
                    setCasilleroData(response.data);
                }
            } catch (error) {
                console.error("Error al cargar datos del casillero:", error);
                Toast.error("Error de conexión", "Error al cargar la información del casillero");
            } finally {
                setLoading(false);
            }
        };

        cargarDatosCasillero();
    }, [session, status]);

    // Manejar confirmación de renuncia
    const handleConfirmarRenuncia = async () => {
        if (!session?.user?.id) {
            Toast.error("Error de sesión", "No se pudo obtener la información del usuario");
            return;
        }

        setProcessingRenuncia(true);
        try {
            const response = await renunciarCasillero(session.user.id);
            
            if (response.error) {
                Toast.error("Error al renunciar", response.message);
            } else {
                Toast.success("¡Renuncia exitosa!", "Tu casillero ha sido liberado correctamente");
                setCasilleroData(null); // Limpiar datos después de la renuncia
            }
        } catch (error) {
            console.error("Error al procesar renuncia:", error);
            Toast.error("Error de conexión", "Error al procesar la renuncia");
        } finally {
            setProcessingRenuncia(false);
            setShowModal(false);
        }
    };

    // Mostrar loading mientras carga la sesión o los datos
    if (loading || status === "loading") {
        return (
            <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8 px-4">
                <div className="w-full">
                    <CabezeraDinamica
                        title="Renunciar al casillero"
                        breadcrumb="Inicio • Renunciar casillero"
                    />
                </div>
                <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-lg border border-gray-200">
                    <div className="flex justify-center items-center h-32">
                        <div className="text-lg">Cargando información del casillero...</div>
                    </div>
                </div>
            </div>
        );
    }

    // Mostrar mensaje si no hay casillero asignado
    if (!casilleroData) {
        return (
            <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8 px-4">
                <div className="w-full">
                    <CabezeraDinamica
                        title="Renunciar al casillero"
                        breadcrumb="Inicio • Renunciar casillero"
                    />
                </div>
                <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-lg border border-blue-200">
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-blue-600 text-xl">📭</span>
                            </div>
                            <h2 className="text-lg font-bold text-blue-600">Sin casillero asignado</h2>
                        </div>
                        
                        <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                            <p className="text-blue-800 font-medium mb-2">
                                Actualmente no tienes ningún casillero asignado.
                            </p>
                            <p className="text-blue-700">
                                No hay nada que renunciar en este momento.
                            </p>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r border border-yellow-300">
                            <div className="flex items-center">
                                <span className="text-yellow-600 text-lg mr-2">💡</span>
                                <p className="text-sm">
                                    <strong className="text-yellow-800">¿Necesitas ayuda?</strong> 
                                    <span className="text-yellow-700 ml-1">Si crees que esto es un error, contacta al administrador.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8 px-4">
            <div className="w-full">
                <CabezeraDinamica
                    title="Renunciar al casillero"
                    breadcrumb="Inicio • Renunciar casillero"
                />
            </div>
            <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-lg border border-red-200">
                <div>
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-red-600 text-xl">⚠️</span>
                        </div>
                        <h2 className="text-lg font-bold text-danger">Leer cuidadosamente...</h2>
                    </div>
                    <p className="mt-4">
                        ¿{capitalizarNombre(session?.user?.name)}, estás seguro de que deseas renunciar a tu casillero?
                    </p>
                    <p className="mt-1">Esta acción es irreversible.</p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-2">Tu casillero actual:</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center bg-blue-50 p-2 rounded-md border border-blue-200">
                                <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                                <strong className="text-blue-800">Número de Casillero:</strong> 
                                <span className="ml-2 font-bold text-blue-900">{casilleroData.numeroCasillero}</span>
                            </li>
                            <li className="flex items-center bg-green-50 p-2 rounded-md border border-green-200">
                                <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                                <strong className="text-green-800">Armario:</strong> 
                                <span className="ml-2 font-bold text-green-900">{casilleroData.codigoArmario}</span>
                            </li>
                        </ul>
                    </div>
                    
                    <p className="mt-4">Si confirmas, tu casillero quedará disponible para otro estudiante.</p>
                    <p>Si fue un error, puedes cancelar esta acción.</p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-4 rounded-r border border-yellow-300">
                        <div className="flex items-center">
                            <span className="text-yellow-600 text-lg mr-2">💡</span>
                            <p className="text-sm">
                                <strong className="text-yellow-800">Recuerda:</strong> 
                                <span className="text-yellow-700 ml-1">Antes de renunciar, asegúrate de retirar todas tus pertenencias.</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-4 mr-8">
                    <button 
                        onClick={() => setShowModal(true)}
                        disabled={processingRenuncia}
                        className="px-4 py-2 bg-danger hover:bg-danger/90 text-white font-bold rounded-lg disabled:opacity-50 disabled:bg-gray-400 transition-colors"
                    >
                        {processingRenuncia ? "Procesando..." : "Aceptar"}
                    </button>
                    <button 
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>

            {/* Modal de doble confirmación */}
            <ConfirmModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirmarRenuncia}
                title="Confirmar renuncia al casillero"
                confirmText={processingRenuncia ? "Procesando..." : "Sí, renunciar"}
                cancelText="No, cancelar"
                confirmColor="danger"
                isLoading={processingRenuncia}
                size="md"
                customContent={casilleroData && (
                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-red-600 text-2xl">📪</span>
                            </div>
                            <p className="text-gray-700 mb-4 text-base">
                                ¿Estás completamente seguro de que deseas renunciar a tu casillero?
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                Esta acción <span className="font-semibold text-danger">NO se puede deshacer</span>.
                            </p>
                        </div>
                        
                        {/* Información del casillero con diseño mejorado */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <h4 className="text-lg font-semibold text-gray-800 mb-1">
                                Casillero #{casilleroData.numeroCasillero}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                                📍 {casilleroData.codigoArmario}
                            </p>
                            <div className="bg-white border border-red-200 rounded-md p-2">
                                <p className="text-xs text-red-700 font-medium">
                                    ⚠️ Recuerda retirar todas tus pertenencias antes de confirmar
                                </p>
                            </div>
                        </div>
                        
                        {/* Información adicional */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-md">
                            <p className="text-xs text-blue-800 leading-relaxed">
                                <span className="font-medium">Nota:</span> Una vez confirmada la renuncia, el casillero quedará disponible 
                                para otros estudiantes y no podrás recuperarlo automáticamente.
                            </p>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

export default RenunciarCasillero;
