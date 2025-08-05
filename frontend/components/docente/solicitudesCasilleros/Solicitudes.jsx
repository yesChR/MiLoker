import React, { useState, useEffect } from "react";
import CabezeraDinamica from "../../Layout/CabeceraDinamica";
import TablaDinamica from "../../Tabla";
import { PiNotePencilFill } from "react-icons/pi";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../../DrawerGeneral";
import useSolicitudesPeriodo from "../../../hooks/useSolicitudesPeriodo";
import { ESTADOS_SOLICITUD } from "../../common/estadosSolicutudes";
import { formatDateShort } from "../../../utils/dateUtils";
import { procesarSolicitud } from "../../../services/solicitudService";
import { obtenerHistorialEstudiante } from "../../../services/estudianteService";
import Toast from "../../CustomAlert";

// Componentes separados
import LoadingSolicitudes from "./LoadingSolicitudes";
import ErrorSolicitudes from "./ErrorSolicitudes";
import FormularioRevision from "./FormularioRevision";
import HistorialEstudiante from "./HistorialEstudiante";

const Solicitudes = ({ estado }) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const [historialEstudiante, setHistorialEstudiante] = useState(null);
    const [cargandoHistorial, setCargandoHistorial] = useState(false);
    const { solicitudes, loading, error, periodo, refrescar } = useSolicitudesPeriodo(estado);
    const estados = {
        [ESTADOS_SOLICITUD.EN_ESPERA]: "En espera",
        [ESTADOS_SOLICITUD.ACEPTADA]: "Aprobadas",
        [ESTADOS_SOLICITUD.RECHAZADA]: "Rechazadas"
    };

    const columnasPrueba = [
        { name: "Cédula", uid: "cedula" },
        { name: "Nombre", uid: "nombre" },
        { name: "Sección", uid: "seccion" },
        { name: "Opción 1", uid: "opcion1" },
        { name: "Opción 2", uid: "opcion2" },
        { name: "Fecha solicitud", uid: "fechaSolicitud" },
        { name: "Revisión", uid: "acciones" },
    ];

    const cargarHistorialEstudiante = async (cedulaEstudiante) => {
        setCargandoHistorial(true);
        try {
            const resultado = await obtenerHistorialEstudiante(cedulaEstudiante);
            if (resultado.error) {
                console.error('Error al cargar historial:', resultado.message);
                setHistorialEstudiante(null);
            } else {
                setHistorialEstudiante(resultado.data);
            }
        } catch (error) {
            console.error('Error al cargar historial:', error);
            setHistorialEstudiante(null);
        } finally {
            setCargandoHistorial(false);
        }
    };

    const obtenerOpcionesCasilleros = () => {
        if (!selectedItem || !selectedItem.casilleros) {
            return [
                { id: 1, nombre: "Opción 1" },
                { id: 2, nombre: "Opción 2" },
                { id: 'ninguna', nombre: "Ninguna" },
            ];
        }

        const opcionesDisponibles = selectedItem.casilleros.map((casillero, index) => ({
            id: casillero.id,
            nombre: `Opción ${index + 1} (${casillero.armario?.idArmario || 'A'}-${casillero.numCasillero})`,
            casillero: casillero
        }));

        opcionesDisponibles.push({ id: 'ninguna', nombre: 'Ninguna' });
        return opcionesDisponibles;
    };

    const manejarEnvio = async () => {
        if (!selectedItem || !selectedItem.opcion) {
            Toast.warning('Opción requerida', 'Por favor seleccione una opción');
            return;
        }

        setProcesando(true);

        try {
            let resultado;

            if (selectedItem.opcion === 'ninguna') {
                // Rechazar toda la solicitud
                if (!selectedItem.razonRechazo || selectedItem.razonRechazo.trim() === '') {
                    Toast.warning('Razón requerida', 'Por favor proporcione una razón para el rechazo');
                    setProcesando(false);
                    return;
                }

                resultado = await procesarSolicitud(
                    selectedItem.id,
                    null, // No hay casillero aprobado
                    selectedItem.razonRechazo
                );
            } else {
                // Aprobar un casillero específico
                resultado = await procesarSolicitud(
                    selectedItem.id,
                    selectedItem.opcion, // ID del casillero aprobado
                    'Solicitud aprobada'
                );
            }

            if (resultado.error) {
                Toast.error('Error al procesar', resultado.message);
            } else {
                Toast.success('¡Solicitud procesada!', resultado.data.message || 'Solicitud procesada exitosamente');
                onOpenChange(false); // Cerrar el drawer
                setSelectedItem(null); // Limpiar selección
                refrescar(); // Recargar datos
            }
        } catch (error) {
            Toast.error('Error inesperado', 'Error inesperado al procesar la solicitud');
            console.error('Error:', error);
        } finally {
            setProcesando(false);
        }
    };

    // Mostrar loading
    if (loading) {
        return <LoadingSolicitudes estado={estado} />;
    }

    // Mostrar error
    if (error) {
        return <ErrorSolicitudes error={error} onReintentar={refrescar} estado={estado} />;
    }

    const manejarCierreDrawer = (isOpen) => {
        if (!isOpen) {
            setSelectedItem(null);
            setHistorialEstudiante(null);
        }
        onOpenChange(isOpen);
    };

    const acciones = [
        {
            tooltip: "Revisar",
            icon: <PiNotePencilFill size={18} />,
            handler: (item) => {
                setSelectedItem({
                    ...item,
                    opcion: null,
                    razonRechazo: ''
                });
                cargarHistorialEstudiante(item.cedula);
                onOpen();
            },
        },
    ];

    const solicitudesFormateadas = solicitudes.map(solicitud => ({
        ...solicitud,
        fechaSolicitud: formatDateShort(solicitud.fechaSolicitud),
        fechaRevision: solicitud.fechaRevision ? formatDateShort(solicitud.fechaRevision) : 'N/A'
    }));

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Solicitudes"
                    breadcrumb={`Inicio • Docente • Solicitudes • ${estados[estado]}`}
                />
            </div>
            <div className="w-full max-w-4xl">
                <div className="flex justify-between mb-4" style={{ marginTop: "50px" }}>
                    <TablaDinamica
                        columns={columnasPrueba}
                        data={solicitudesFormateadas}
                        acciones={acciones}
                        onOpen={onOpen}
                        ocultarAgregar={true}
                        mostrarAcciones={false}
                    />
                </div>
                <DrawerGeneral
                    titulo={`Revisión - ${selectedItem?.nombre || ""}`}
                    size={"sm"}
                    isOpen={isOpen}
                    onOpen={onOpen}
                    onOpenChange={manejarCierreDrawer}
                    mostrarBotones={false}
                >
                    <FormularioRevision
                        selectedItem={selectedItem}
                        setSelectedItem={setSelectedItem}
                        procesando={procesando}
                        obtenerOpcionesCasilleros={obtenerOpcionesCasilleros}
                        manejarEnvio={manejarEnvio}
                        estado={estado}
                    />

                    <HistorialEstudiante
                        historialEstudiante={historialEstudiante}
                        cargandoHistorial={cargandoHistorial}
                    />
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default Solicitudes;