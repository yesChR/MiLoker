import React, { useState } from "react";
import CabezeraDinamica from "../../Layout/CabeceraDinamica";
import { Button } from "@heroui/react";
import { LuSendHorizontal } from "react-icons/lu";
import { useArmarios } from "../../../hooks/useArmarios";
import { useSolicitudCasillero } from "../../../hooks/useSolicitudCasillero";
import PaginacionArmarios from "./PaginacionArmarios";
import GrillaCasilleros from "./GrillaCasilleros";
import ModalConfirmacionSolicitud from "./ModalConfirmacionSolicitud";
import LoadingCasilleros from "./LoadingCasilleros";
import EmptyCasilleros from "./EmptyCasilleros";

const SolicitudCasillero = () => {
    const [currentPage, setCurrentPage] = useState(1);

    // Custom hooks para separar la lógica
    const { armariosData, loadingArmarios, recargarArmarios } = useArmarios();
    const {
        selectedCasilleros,
        loading,
        showAlert,
        setShowAlert,
        handleCasilleroClick,
        handleEnviarSolicitud,
        confirmarEnvioSolicitud
    } = useSolicitudCasillero();


    const armarioActual = armariosData.length > 0 ? armariosData[currentPage - 1] : null;

    const onCasilleroClick = (casillero) => {
        handleCasilleroClick(casillero, armarioActual);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-3">
            <div className="w-full">
                <CabezeraDinamica
                    title="Solicitud Casillero"
                    breadcrumb="Inicio • Solicitud Casillero"
                />
            </div>

            {/* Instrucciones atractivas */}
            <div className="w-full max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="flex-shrink-0">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xs">📝</span>
                            </div>
                        </div>
                        <h3 className="text-base font-semibold text-gray-800">¿Cómo solicitar tu casillero?</h3>
                    </div>
                    <p className="text-gray-600 mb-3 leading-normal text-sm">
                        Selecciona <span className="font-semibold text-purple-600">dos opciones de casillero</span> que desees. 
                        Tu <span className="font-semibold text-purple-600">primera selección</span> tendrá prioridad, 
                        pero si no hay cupos disponibles, se considerará automáticamente tu 
                        <span className="font-semibold text-orange-500"> segunda opción</span>.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-2 mb-3 rounded-r-lg">
                        <div className="flex items-start space-x-2">
                            <span className="text-blue-600 font-bold text-sm">💡</span>
                            <p className="text-blue-700 text-xs leading-relaxed">
                                <span className="font-medium">Tip:</span> Elige tu casillero preferido como primera opción 
                                y uno alternativo como segunda opción para aumentar tus posibilidades de asignación.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center space-x-1 bg-white rounded-full px-2 py-1 border border-purple-200 shadow-sm">
                            <div className="w-2 h-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full"></div>
                            <span className="text-xs text-gray-700 font-medium">🥇 Opción preferida</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-white rounded-full px-2 py-1 border border-orange-200 shadow-sm">
                            <div className="w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"></div>
                            <span className="text-xs text-gray-700 font-medium">🥈 Opción alternativa</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-white rounded-full px-2 py-1 border border-blue-200 shadow-sm">
                            <div className="w-2 h-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
                            <span className="text-xs text-gray-700 font-medium">✅ Disponible</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-white rounded-full px-2 py-1 border border-red-200 shadow-sm">
                            <div className="w-2 h-2 bg-danger rounded-full"></div>
                            <span className="text-xs text-gray-700 font-medium">❌ No disponible</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row w-full max-w-2xl mx-auto lg:space-x-4 space-y-3 lg:space-y-0 lg:items-center">
               {!loadingArmarios && armariosData.length > 0 && (
                <div className="order-1 lg:order-1 lg:self-center">
                    <PaginacionArmarios
                        armarios={armariosData}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
                )}
                <div className="flex flex-col flex-grow space-y-4 order-2 lg:order-2">
                    {loadingArmarios ? (
                        <LoadingCasilleros />
                    ) : armariosData.length === 0 ? (
                        <EmptyCasilleros 
                            onReload={recargarArmarios}
                            especialidad="tu especialidad"
                        />
                    ) : (
                        <GrillaCasilleros
                            armario={armarioActual}
                            selectedCasilleros={selectedCasilleros}
                            onCasilleroClick={onCasilleroClick}
                            loading={loading}
                        />
                    )}
                </div>
            </div>

            {!loadingArmarios && armariosData.length > 0 && (
                <div className="flex w-full max-w-2xl mx-auto justify-end mt-3">
                    <Button
                        className="bg-primario text-white rounded-md flex items-center space-x-2"
                        disabled={loading}
                        onPress={handleEnviarSolicitud}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Enviando...</span>
                            </>
                        ) : (
                            <>
                                <span>Enviar solicitud</span>
                                <LuSendHorizontal className="w-5 h-5" />
                            </>
                        )}
                    </Button>
                </div>
            )}

            <ModalConfirmacionSolicitud
                isOpen={showAlert}
                onClose={() => setShowAlert(false)}
                onConfirm={confirmarEnvioSolicitud}
                selectedCasilleros={selectedCasilleros}
                loading={loading}
            />
        </div>
    );
};

export default SolicitudCasillero;