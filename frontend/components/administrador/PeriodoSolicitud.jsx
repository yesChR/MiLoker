import { Button, DatePicker } from "@heroui/react"; // Usa DatePicker de HeroUI
import { BiCalendar } from "react-icons/bi";
import { FiRefreshCw } from "react-icons/fi";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import { useState } from "react";
import { parseAbsoluteToLocal } from "@internationalized/date";
import CustomAlert from "../CustomAlert"; // Importa el componente de alerta personalizada

const PeriodoSolicitud = () => {
    const [inicioSolicitud, setInicioSolicitud] = useState(parseAbsoluteToLocal(new Date().toISOString()));
    const [finSolicitud, setFinSolicitud] = useState(parseAbsoluteToLocal(new Date().toISOString()));
    const [inicioAsignacion, setInicioAsignacion] = useState(parseAbsoluteToLocal(new Date().toISOString()));
    const [finAsignacion, setFinAsignacion] = useState(parseAbsoluteToLocal(new Date().toISOString()));
    const [showAlert, setShowAlert] = useState(false); // Estado para mostrar la alerta

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
        setShowAlert(true); // Muestra la alerta
    };

    const handleConfirmRestablecer = () => {
        setShowAlert(false); // Oculta la alerta
        console.log("Período restablecido");
        // Lógica para restablecer el período
    };

    const handleCancelRestablecer = () => {
        setShowAlert(false); // Oculta la alerta
        console.log("Acción cancelada");
    };

    const handleActualizar = (e) => {
        e.preventDefault();
        console.log("Inicio Solicitud:", inicioSolicitud);
        console.log("Fin Solicitud:", finSolicitud);
        console.log("Inicio Asignación:", inicioAsignacion);
        console.log("Fin Asignación:", finAsignacion);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Períodos de solicitud"
                    breadcrumb="Home • Períodos de solicitud"
                />
            </div>
            <div className="flex flex-wrap justify-between gap-4">
                {tarjetas.map((tarjeta, index) => (
                    <div
                        key={index}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-md ${tarjeta.color} w-full sm:w-[325px] h-[100px] ${tarjeta.titulo === "Restablecer"
                            ? "cursor-pointer hover:shadow-lg hover:bg-red-300 transition-transform duration-200 hover:scale-105"
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
            <form onSubmit={handleActualizar} className="border-2 border-gray-200 rounded-lg p-6 bg-white w-full max-w-[600px] text-center">
                <div className="bg-blue-600 text-white p-2 rounded-md font-bold">Fechas de períodos activos</div>
                <div className="mt-4 flex flex-col text-left">
                    <label className="block font-bold text-gray-700 mb-2">Período de solicitud:</label>
                    <div className="flex flex-wrap gap-4 sm:flex-nowrap">
                        <div className="w-full sm:w-1/2">
                            <label className="block text-gray-700">Inicio:</label>
                            <DatePicker
                                value={inicioSolicitud}
                                onChange={setInicioSolicitud}
                                granularity="day"
                                className="w-full"
                                placeholder="Selecciona una fecha"
                            />
                        </div>
                        <div className="w-full sm:w-1/2">
                            <label className="block text-gray-700">Fin:</label>
                            <DatePicker
                                value={finSolicitud}
                                onChange={setFinSolicitud}
                                granularity="day"
                                className="w-full"
                                placeholder="Selecciona una fecha"
                            />
                        </div>
                    </div>
                    <label className="block font-bold text-gray-700 mt-3 mb-2">Período de asignación:</label>
                    <div className="flex flex-wrap gap-4 sm:flex-nowrap">
                        <div className="w-full sm:w-1/2">
                            <label className="block text-gray-700">Inicio:</label>
                            <DatePicker
                                value={inicioAsignacion}
                                onChange={setInicioAsignacion}
                                granularity="day"
                                className="w-full"
                                placeholder="Selecciona una fecha"
                            />
                        </div>
                        <div className="w-full sm:w-1/2">
                            <label className="block text-gray-700">Fin:</label>
                            <DatePicker
                                value={finAsignacion}
                                onChange={setFinAsignacion}
                                granularity="day"
                                className="w-full"
                                placeholder="Selecciona una fecha"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button type="submit" className="bg-blue-600 text-white w-[160px]">
                            Actualizar
                        </Button>
                    </div>
                </div>
            </form>

            {showAlert && (
                <div className="fixed top-10 right-4 z-50">
                    <CustomAlert
                        color="danger"
                        variant="bordered"
                        aria-labelledby="alert-title"
                        size="sm"
                        className="max-w-md"
                        title="Precaución"
                        description="¿Estás seguro de que deseas restablecer el período de solicitud? Esta acción no se puede deshacer."
                    >
                        <div className="flex items-center gap-2 mt-3">
                            <Button
                                className="bg-transparent text-danger"
                                size="sm"
                                onPress={handleConfirmRestablecer}
                            >
                                Confirmar
                            </Button>
                            <Button
                                className="bg-transparent text-black"
                                size="sm"
                                onPress={handleCancelRestablecer}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </CustomAlert>
                </div>
            )}
        </div>
    );
};

export default PeriodoSolicitud;