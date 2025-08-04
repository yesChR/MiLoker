import React, { useState } from "react";
import CabezeraDinamica from "../../Layout/CabeceraDinamica";
import TablaDinamica from "../../Tabla";
import { PiNotePencilFill } from "react-icons/pi";
import { Select, SelectItem } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../../DrawerGeneral";
import { Divider } from "@heroui/react";
import { Button } from "@heroui/react";
import { LuSendHorizontal } from "react-icons/lu";
import useSolicitudesPeriodo from "../../../hooks/useSolicitudesPeriodo";
import { ESTADOS_SOLICITUD } from "../../common/estadosSolicutudes";
import { formatDateShort } from "../../../utils/dateUtils";
import { procesarSolicitud } from "../../../services/solicitudService";

const Solicitudes = ({ estado }) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null);
    const [procesando, setProcesando] = useState(false);
    
    // Hook personalizado para obtener datos del periodo activo
    const { solicitudes, loading, error, periodo, refrescar } = useSolicitudesPeriodo(estado);

    const estados = {
        [ESTADOS_SOLICITUD.EN_REVISION]: "En revisión",
        [ESTADOS_SOLICITUD.ACEPTADA]: "Aprobadas", 
        [ESTADOS_SOLICITUD.RECHAZADA]: "Rechazadas",
        [ESTADOS_SOLICITUD.EN_ESPERA]: "En espera",
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

    const opciones = [
        { id: 1, nombre: "Opción 1" },
        { id: 2, nombre: "Opción 2" }, 
        { id: 3, nombre: "Ninguna" },
    ];

    // Función para obtener las opciones de casilleros del estudiante seleccionado
    const obtenerOpcionesCasilleros = () => {
        if (!selectedItem || !selectedItem.casilleros) {
            return [
                { id: 1, nombre: "Opción 1" },
                { id: 2, nombre: "Opción 2" }, 
                { id: 'ninguna', nombre: "Ninguna" },
            ];
        }
        
        const opciones = selectedItem.casilleros.map((casillero, index) => ({
            id: casillero.id,
            nombre: `Opción ${index + 1} (${casillero.armario?.idArmario || 'A'}-${casillero.numCasillero})`,
            casillero: casillero
        }));
        
        opciones.push({ id: 'ninguna', nombre: 'Ninguna' });
        return opciones;
    };

    // Función para manejar el envío del formulario
    const manejarEnvio = async () => {
        if (!selectedItem || !selectedItem.opcion) {
            alert('Por favor seleccione una opción');
            return;
        }

        setProcesando(true);
        
        try {
            let resultado;
            
            if (selectedItem.opcion === 'ninguna') {
                // Rechazar toda la solicitud
                if (!selectedItem.razonRechazo || selectedItem.razonRechazo.trim() === '') {
                    alert('Por favor proporcione una razón para el rechazo');
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
                alert(`Error: ${resultado.message}`);
            } else {
                alert(resultado.data.message || 'Solicitud procesada exitosamente');
                onOpenChange(false); // Cerrar el drawer
                setSelectedItem(null); // Limpiar selección
                refrescar(); // Recargar datos
            }
        } catch (error) {
            alert('Error inesperado al procesar la solicitud');
            console.error('Error:', error);
        } finally {
            setProcesando(false);
        }
    };

    // Mostrar loading
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">Cargando solicitudes...</p>
            </div>
        );
    }

    // Mostrar error
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-64">
                <p className="text-red-600 text-center">{error}</p>
                <Button 
                    className="mt-4" 
                    color="primary" 
                    onClick={refrescar}
                >
                    Reintentar
                </Button>
            </div>
        );
    }

    const casillerosAnteriores = [
        { casillero: "A - 1" },
        { casillero: "A - 2" },
        { casillero: "A - 3" },
        { casillero: "A - 4" },
        { casillero: "A - 5" },
        { casillero: "A - 6" },
    ];

    const opcionesRevision = [
        { id: 1, nombre: "Opción 1" },
        { id: 2, nombre: "Opción 2" },
        { id: 3, nombre: "Ninguna" },
    ];

    const incidentesRelacionados = [
        { incidente: " El casillero presentaba daños severos" },
    ];

    const accionesPrueba = [
        {
            tooltip: "Revisar",
            icon: <PiNotePencilFill size={18} />,
            handler: (item) => {
                setSelectedItem({
                    ...item,
                    opcion: null,
                    razonRechazo: ''
                }); // Guarda el elemento seleccionado y resetea campos
                onOpen(); // Abre el Drawer
            },
        },
    ];

    // Función para manejar el cierre del drawer
    const manejarCierreDrawer = (isOpen) => {
        if (!isOpen) {
            setSelectedItem(null); // Limpiar selección al cerrar
        }
        onOpenChange(isOpen);
    };

    // Formatear las fechas en los datos de solicitudes
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
                        acciones={accionesPrueba}
                        onOpen={onOpen}
                        ocultarAgregar={true}
                        mostrarAcciones={false}
                    />
                </div>
                <DrawerGeneral
                    titulo={`Revisión - ${selectedItem?.nombre || ""}`}
                    size={"xs"}
                    isOpen={isOpen}
                    onOpen={onOpen}
                    onOpenChange={manejarCierreDrawer}
                    mostrarBotones={false}
                > {estado === ESTADOS_SOLICITUD.EN_REVISION && (
                    <div className="flex flex-col mb-4">

                        <>
                            <Select
                                placeholder="Elegir opción"
                                onSelectionChange={(value) => {
                                    console.log("Selected value:", value.currentKey);
                                    setSelectedItem((prev) => ({
                                        ...prev,
                                        opcion: value.currentKey === 'ninguna' ? 'ninguna' : parseInt(value.currentKey),
                                    }));
                                }}
                                variant={"bordered"}
                                className="focus:border-primario mb-4"
                                color="primary"
                                isDisabled={procesando}
                            >
                                {obtenerOpcionesCasilleros().map((opcion) => (
                                    <SelectItem key={opcion.id} value={opcion.id}>
                                        {opcion.nombre}
                                    </SelectItem>
                                ))}
                            </Select>
                            {selectedItem?.opcion === 'ninguna' && (
                                <textarea
                                    className="w-full border rounded-lg p-2 text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                                    rows="4"
                                    placeholder="Escribe la razón del rechazo..."
                                    value={selectedItem?.razonRechazo || ''}
                                    onChange={(e) =>
                                        setSelectedItem((prev) => ({
                                            ...prev,
                                            razonRechazo: e.target.value,
                                        }))
                                    }
                                    disabled={procesando}
                                ></textarea>
                            )}

                            <div className="flex justify-end">
                                <Button 
                                    color="primary" 
                                    endContent={<LuSendHorizontal />}
                                    onClick={manejarEnvio}
                                    isLoading={procesando}
                                    isDisabled={procesando}
                                >
                                    {procesando ? 'Procesando...' : 'Enviar'}
                                </Button>
                            </div>
                            <Divider className="mt-4" />
                        </>

                    </div>

                )}
                    <div className="flex flex-col mb-4">
                        <label className="text-azulOscuro font-bold text-xl">Historial</label>

                        {casillerosAnteriores.length > 0 && (
                            <div className="mt-4">
                                <h2 className="text-gray-700 font-bold text-sm mb-2">Casilleros anteriores:</h2>
                                <ul className="list-disc list-inside">
                                    {casillerosAnteriores.map((casillero, index) => (
                                        <li key={index} className="text-gray-600 text-sm">
                                            {casillero.casillero}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {incidentesRelacionados.length > 0 && (
                            <div className="mt-4">
                                <h2 className="text-gray-700 font-bold text-sm mb-2">Incidentes relacionados:</h2>
                                <ul className="list-disc list-inside">
                                    {incidentesRelacionados.map((incidente, index) => (
                                        <li key={index} className="text-gray-600 text-sm">
                                            {incidente.incidente}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default Solicitudes;