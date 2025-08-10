import React from "react";
import SolicitudAceptada from "./SolicitudAceptada";
import SolicitudRechazada from "./SolicitudRechazada";
import SolicitudEnEspera from "./SolicitudEnEspera";

const EstadoContent = ({ estado, estudiante, casilleroAsignado, justificacion }) => {
    const renderContent = () => {
        switch (estado) {
            case "aceptada":
                return (
                    <SolicitudAceptada 
                        estudiante={estudiante} 
                        casilleroAsignado={casilleroAsignado} 
                    />
                );
            case "rechazada":
                return (
                    <SolicitudRechazada 
                        estudiante={estudiante} 
                        justificacion={justificacion} 
                    />
                );
            case "espera":
                return (
                    <SolicitudEnEspera 
                        estudiante={estudiante} 
                    />
                );
            default:
                return (
                    <SolicitudEnEspera 
                        estudiante={estudiante} 
                    />
                );
        }
    };

    return (
        <div className="w-full max-w-3xl p-6 bg-white shadow-lg rounded-lg border border-gray-200">
            {renderContent()}
        </div>
    );
};

export default EstadoContent;
