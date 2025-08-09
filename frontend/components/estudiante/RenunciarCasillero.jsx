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
                <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-lg border border-gray-200">
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-gray-600 mb-4">Sin casillero asignado</h2>
                        <p className="text-gray-500">
                            Actualmente no tienes ningún casillero asignado.
                        </p>
                        <p className="text-gray-500 mt-2">
                            Si crees que esto es un error, contacta al administrador.
                        </p>
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
            <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-lg border border-gray-200">
                <div>
                    <h2 className="text-lg font-bold text-danger">Leer cuidadosamente...</h2>
                    <p className="mt-4">
                        ¿{capitalizarNombre(session?.user?.name)}, estás seguro de que deseas renunciar a tu casillero?
                    </p>
                    <p className="mt-1">Esta acción es irreversible.</p>
                    <ul className="mt-4 list-disc list-inside">
                        <li>
                            <strong className="text-black">Número de Casillero:</strong> {casilleroData.numeroCasillero}
                        </li>
                        <li>
                            <strong className="text-black">Armario:</strong> {casilleroData.codigoArmario}
                        </li>
                    </ul>
                    <p className="mt-4">Si confirmas, tu casillero quedará disponible para otro estudiante.</p>
                    <p>Si fue un error, puedes cancelar esta acción.</p>
                    <p className="mt-4">
                        <strong className="text-danger">Recuerda:</strong> Antes de renunciar, asegúrate de retirar todas tus pertenencias.
                    </p>
                </div>
                <div className="flex justify-end mt-6 space-x-4 mr-8">
                    <button 
                        onClick={() => setShowModal(true)}
                        disabled={processingRenuncia}
                        className="text-gray-500 font-bold rounded-lg hover:text-rose-600 disabled:opacity-50"
                    >
                        {processingRenuncia ? "Procesando..." : "Aceptar"}
                    </button>
                    <button 
                        onClick={() => window.history.back()}
                        className="text-danger font-bold rounded-lg hover:text-gray-300"
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
                            <p className="text-gray-700 mb-4 text-base">
                                ¿Estás completamente seguro de que deseas renunciar a tu casillero?
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                Esta acción <span className="font-semibold text-danger">NO se puede deshacer</span>.
                            </p>
                        </div>
                        
                        {/* Información del casillero con diseño atractivo */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-red-600 font-bold text-xl">
                                    📪
                                </span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-1">
                                Casillero #{casilleroData.numeroCasillero}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                                {casilleroData.codigoArmario}
                            </p>
                            <div className="bg-white border border-red-200 rounded-md p-2 mt-3">
                                <p className="text-xs text-red-700 font-medium">
                                    ⚠️ Recuerda retirar todas tus pertenencias antes de confirmar
                                </p>
                            </div>
                        </div>
                        
                        {/* Información adicional */}
                        <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded-r-md">
                            <p className="text-xs text-gray-600 leading-relaxed">
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
