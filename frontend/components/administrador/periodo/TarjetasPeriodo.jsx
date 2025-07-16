import { BiCalendar } from "react-icons/bi";
import { FiRefreshCw } from "react-icons/fi";
import { ESTADOS } from "../../common/estados";
import { formatearFecha } from "../../../services/periodoService";

const TarjetasPeriodo = ({ periodos, onRestablecer }) => {

    const obtenerDatosTarjeta = (tipo) => {
        const periodo = periodos.find(p => p.tipo === tipo);
        if (!periodo) {
            return {
                fechaInicio: "No definido",
                fechaFin: "No definido",
                color: "bg-gray-200",
                vencido: false
            };
        }

        // Verificar si el período está vencido
        const ahora = new Date();
        const fechaFin = new Date(periodo.fechaFin);
        const estaVencido = fechaFin < ahora;

        // Colores según el tipo y estado
        let color;
        if (estaVencido) {
            color = 'bg-red-100 border-2 border-red-300'; // Estilo especial para vencido
        } else {
            color = tipo === 2 ? 'bg-green-300' : 'bg-yellow-200'; // Solicitud verde, Asignación amarillo
        }

        return {
            fechaInicio: formatearFecha(periodo.fechaInicio),
            fechaFin: formatearFecha(periodo.fechaFin),
            color: color,
            vencido: estaVencido
        };
    };

    const tarjetas = [
        {
            titulo: "Período de solicitud",
            ...obtenerDatosTarjeta(2),
            icono: <BiCalendar className="w-6 h-6 text-gray-700" />,
        },
        {
            titulo: "Período de asignación",
            ...obtenerDatosTarjeta(1),
            icono: <BiCalendar className="w-6 h-6 text-yellow-700" />,
        },
        {
            titulo: "Restablecer",
            descripcion: "Se eliminará la asignación de casilleros",
            color: "bg-red-200",
            icono: <FiRefreshCw className="w-6 h-6 text-red-700" />,
        },
    ];

    return (
        <div className="flex flex-wrap justify-between gap-6">
            {tarjetas.map((tarjeta, index) => (
                <div
                    key={index}
                    className={`flex flex-col items-center justify-center py-6 rounded-lg shadow-md ${tarjeta.color} w-full sm:w-[325px] h-[120px] ${tarjeta.titulo === "Restablecer"
                            ? "cursor-pointer hover:shadow-lg hover:bg-red-300 transition-transform duration-200 hover:scale-105"
                            : ""
                        }`}
                    onClick={() => {
                        if (tarjeta.titulo === "Restablecer") {
                            onRestablecer();
                        }
                    }}
                >
                    <div className="flex items-center justify-center mt-3">
                        {tarjeta.icono}
                        {tarjeta.vencido && (
                            <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                                VENCIDO
                            </span>
                        )}
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${tarjeta.vencido ? 'text-red-700' : 'text-gray-800'}`}>
                        {tarjeta.titulo}
                    </h3>
                    {tarjeta.fechaInicio && tarjeta.fechaFin ? (
                        <div className="text-center">
                            <p className={`text-sm ${tarjeta.vencido ? 'text-red-600 line-through' : 'text-gray-600'}`}>
                                {tarjeta.fechaInicio} a {tarjeta.fechaFin}
                            </p>
                            {tarjeta.vencido && (
                                <p className="text-xs text-red-500 font-semibold mt-1 mb-2">
                                    ⚠️ Este período ha expirado
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600">
                            {tarjeta.descripcion}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TarjetasPeriodo;
