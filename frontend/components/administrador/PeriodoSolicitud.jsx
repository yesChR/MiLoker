import Swal from "sweetalert2";
import { BiCalendar } from "react-icons/bi";
import { FiRefreshCw } from "react-icons/fi";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import { useState } from "react";

const PeriodoSolicitud = () => {
    const [inicioSolicitud, setInicioSolicitud] = useState("2025-02-20");
    const [finSolicitud, setFinSolicitud] = useState("2025-03-01");
    const [inicioAsignacion, setInicioAsignacion] = useState("2025-02-20");
    const [finAsignacion, setFinAsignacion] = useState("2025-03-01");

    const tarjetas = [
        {
            titulo: "Período de solicitud",
            fechaInicio: "20/feb/2025",
            fechaFin: "01/mar/2025",
            color: "bg-gray-200",
            icono: <BiCalendar className="w-6 h-6 text-gray-700" />,
        },
        {
            titulo: "Período de asignación",
            fechaInicio: "20/feb/2025",
            fechaFin: "01/mar/2025",
            color: "bg-yellow-200",
            icono: <BiCalendar className="w-6 h-6 text-yellow-700" />,
        },
        {
            titulo: "Restablecer",
            descripcion: "Se eliminará la asignación de casilleros",
            color: "bg-red-200",
            icono: <FiRefreshCw className="w-6 h-6 text-red-700" />,
        },
    ];

    const handleRestablecer = () => {
        Swal.fire({
            position: "top-end",
            icon: "warning",
            title: "¿Estás seguro?",
            text: "Se eliminará la asignación de casilleros.",
            showCancelButton: true,
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Casilleros restablecidos",
                    showConfirmButton: false,
                    timer: 1500,
                });
                console.log("Restablecer confirmado");
            } else {
                console.log("Restablecer cancelado");
            }
        });
    };

    const handleActualizar = (e) => {
        e.preventDefault();
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Fechas actualizadas",
            text: `Solicitud: ${inicioSolicitud} - ${finSolicitud}\nAsignación: ${inicioAsignacion} - ${finAsignacion}`,
            showConfirmButton: false,
            timer: 1500,
        });
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Períodos de solicitud"
                    breadcrumb="Home • Períodos de solicitud"
                />
            </div>
            <div className="flex justify-between gap-4">
                {tarjetas.map((tarjeta, index) => (
                    <div
                        key={index}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-md ${tarjeta.color} w-[325px] h-[100px] ${tarjeta.titulo === "Restablecer"
                            ? "cursor-pointer hover:shadow-lg hover:bg-red-300"
                            : ""
                            }`}
                        onClick={() => {
                            if (tarjeta.titulo === "Restablecer") {
                                handleRestablecer();
                            }
                        }}
                    >
                        <div className="flex items-center justify-center mb-2">
                            {tarjeta.icono}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            {tarjeta.titulo}
                        </h3>
                        {tarjeta.fechaInicio && tarjeta.fechaFin ? (
                            <p className="text-sm text-gray-600">
                                {tarjeta.fechaInicio} a {tarjeta.fechaFin}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-600">
                                {tarjeta.descripcion}
                            </p>
                        )}
                    </div>
                ))}
            </div>
            <form onSubmit={handleActualizar} className="border-2 border-gray-200 rounded-lg p-6 bg-white w-[600px] text-center">
                <div className="bg-blue-600 text-white p-2 rounded-md font-bold">Fechas de períodos activos</div>
                <div className="mt-4 flex flex-col text-left">
                    <label className="block font-bold text-gray-700 mb-2">Período de solicitud:</label>
                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <label className="block text-gray-700">Inicio:</label>
                            <input type="date" className="border p-2 w-full rounded-md text-gray-500" color="primary" value={inicioSolicitud} onChange={(e) => setInicioSolicitud(e.target.value)} />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-gray-700">Fin:</label>
                            <input type="date" className="border p-2 w-full rounded-md text-gray-500" color="primary" value={finSolicitud} onChange={(e) => setFinSolicitud(e.target.value)} />
                        </div>
                    </div>
                    <label className="block font-bold text-gray-700 mt-3 mb-2">Período de asignación:</label>
                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <label className="block text-gray-700">Inicio:</label>
                            <input type="date" className="border p-2 w-full rounded-md text-gray-500" color="primary" value={inicioAsignacion} onChange={(e) => setInicioAsignacion(e.target.value)} />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-gray-700">Fin:</label>
                            <input type="date" className="border p-2 w-full rounded-md text-gray-500" color="primary" value={finAsignacion} onChange={(e) => setFinAsignacion(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button type="submit" className="bg-blue-600 text-white w-[160px] p-2 rounded-md">Actualizar</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PeriodoSolicitud;