import CabezeraDinamica from "../../Layout/CabeceraDinamica";
import React from "react";
import RowSteps from "../RowSteps";
import { useEstadoSolicitud } from "../../../hooks/useEstadoSolicitud";
import LoadingSpinner from "./LoadingSpinner";
import ErrorState from "./ErrorState";
import EstadoContent from "./EstadoContent";
import StepIcon from "./StepIcon";

const EstadoSolicitud = () => {
    const {
        solicitudData,
        loading,
        error,
        getCurrentStep,
        getCasilleroAsignado,
        getEstadoTexto,
        ESTADOS_SOLICITUD
    } = useEstadoSolicitud();

    // Mostrar loading
    if (loading) {
        return <LoadingSpinner />;
    }

    // Mostrar error
    if (error || !solicitudData) {
        return <ErrorState error={error} />;
    }

    const estado = getEstadoTexto();
    const estudiante = solicitudData.estudiante;
    const casilleroAsignado = getCasilleroAsignado();

    const getStepTitle = () => {
        switch (estado) {
            case "aceptada":
                return "Aceptada";
            case "rechazada":
                return "Rechazada";
            case "espera":
                return "En Espera";
            default:
                return "Resultado";
        }
    };

    const steps = [
        {
            title: "Enviada",
        },
        {
            title: "En Revisión",
        },
        {
            title: getStepTitle(),
            icon: <StepIcon estado={estado} />,
        },
    ];

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Estado de solicitudes"
                    breadcrumb="Inicio • Estado de solicitudes"
                />
            </div>

            <div className="w-full items-center flex justify-center">
                <RowSteps
                    className="flex justify-center items-center mt-6 ml-24"
                    defaultStep={getCurrentStep()}
                    steps={steps}
                />
            </div>

            <EstadoContent
                estado={estado}
                estudiante={estudiante}
                casilleroAsignado={casilleroAsignado}
                justificacion={solicitudData.justificacion}
            />
        </div>
    );
};

export default EstadoSolicitud;