import CabezeraDinamica from "../Layout/CabeceraDinamica";
import React from "react";
import RowSteps from "./row-steps";

const EstadoSolicitud = () => {

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Administradores"
                    breadcrumb="Inicio • Administradores"
                />
            </div>
            <RowSteps
                defaultStep={2}
                steps={[
                    {
                        title: "Enviada",
                    },
                    {
                        title: "En revisión",
                    },
                    {
                        title: "Aceptada",
                    },
                ]}
            />
        </div>
    );
};

export default EstadoSolicitud;