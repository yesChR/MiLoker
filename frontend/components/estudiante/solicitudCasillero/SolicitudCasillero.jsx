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
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-6">
            <div className="w-full">
                <CabezeraDinamica
                    title="Solicitud Casillero"
                    breadcrumb="Inicio • Solicitud Casillero"
                />
            </div>

            <div className="flex flex-col lg:flex-row w-full max-w-2xl mx-auto lg:space-x-6 space-y-6 lg:space-y-0 lg:items-center">
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
                <div className="flex w-full max-w-2xl mx-auto justify-end mt-6">
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