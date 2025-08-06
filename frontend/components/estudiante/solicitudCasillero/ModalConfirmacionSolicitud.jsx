import React from "react";
import ConfirmModal from "../../ConfirmModal";
import cn from "classnames";
import { FiBox, FiCheck } from "react-icons/fi";

const ModalConfirmacionSolicitud = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    selectedCasilleros, 
    loading 
}) => {
    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Confirmar Solicitud de Casillero"
            confirmText={loading ? "Enviando..." : "Confirmar"}
            cancelText="Cancelar"
            confirmColor="success"
            customContent={
                <div className="py-1">
                    {/* Pregunta principal con mejor estilo */}
                    <div className="text-center mb-4">
                        <p className="text-base text-gray-700 font-medium mb-1">
                            ¿Confirma el envío de su solicitud?
                        </p>
                        <p className="text-xs text-gray-500">
                            Se registrarán las siguientes opciones de casillero:
                        </p>
                    </div>

                    {/* Lista de casilleros con diseño mejorado */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="space-y-2">
                            {selectedCasilleros.map((casillero, index) => (
                                <div
                                    key={`${casillero.armarioId}-${casillero.id}`}
                                    className={cn(
                                        "flex items-center justify-center p-2 rounded-md border transition-all duration-200",
                                        index === 0 
                                            ? "bg-purple-50 border-purple-200 text-purple-700" 
                                            : "bg-orange-50 border-orange-200 text-orange-700"
                                    )}
                                >
                                    {/* Icono y número de opción */}
                                    <div className="flex items-center space-x-2">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs",
                                            index === 0 ? "bg-purple-500" : "bg-orange-500"
                                        )}>
                                            {index + 1}
                                        </div>
                                        <FiBox className="w-4 h-4" />
                                        <div className="text-center">
                                            <p className="font-semibold text-sm">
                                                Armario {casillero.armarioNombre || casillero.armarioId}
                                            </p>
                                            <p className="text-xs opacity-80">
                                                Casillero #{casillero.numCasillero}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nota importante con icono */}
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-2 rounded-r-md">
                        <div className="flex items-start space-x-2">
                            <FiCheck className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-700 leading-relaxed">
                                <span className="font-medium">Importante:</span> Esta solicitud será procesada por el sistema y no se puede modificar una vez enviada.
                            </p>
                        </div>
                    </div>
                </div>
            }
        />
    );
};

export default ModalConfirmacionSolicitud;
