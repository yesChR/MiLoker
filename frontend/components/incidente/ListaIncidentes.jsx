import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import DrawerGeneral from "../DrawerGeneral";
import { useDisclosure, Chip, Spinner, Tooltip } from "@heroui/react";
import { PiNotePencilFill } from "react-icons/pi";
import { FiEye, FiPlus } from "react-icons/fi";
import "react-multi-carousel/lib/styles.css";
import FormularioRevision from "./FormularioRevision";
import FormularioCreacion from "./FormularioCreacion";
import DetalleIncidente from "./DetalleIncidente";
import { useIncidentes } from "../../hooks/useIncidentes";
import { obtenerTextoEstado, obtenerColorEstado, ESTADOS_INCIDENTE } from "../../utils/incidenteConstants";
import { ROLES } from "../../common/roles";
import { ACCIONES_DRAWER } from "../../utils/accionesDrawer";

import { Toast } from "../CustomAlert";

const ListaIncidentes = () => {
    const { data: session, status } = useSession();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { incidentes, listarIncidentes, loading, error } = useIncidentes();
    
    const [selectedItem, setSelectedItem] = useState(null);
    const [accion, setAccion] = useState(""); // "revisar", "crear" o "detalle"
    
    // Referencias a los formularios
    const formularioCreacionRef = useRef(null);
    const formularioRevisionRef = useRef(null);

    // Esperar a que la sesión esté lista antes de validar el rol
    const esProfesor = useMemo(() => {
        if (status === 'loading' || !session?.user?.rol) return false;
        return session.user.rol === ROLES.PROFESOR;
    }, [session, status]);

    const columnas = [
        { name: "ID", uid: "idIncidente" },
        { name: "Casillero", uid: "casillero" },
        { name: "Reportado por", uid: "reportante" },
        { name: "Detalle", uid: "detalle" },
        { name: "Estado", uid: "estadoChip" },
        { name: "Fecha", uid: "fechaCreacion" },
        { name: "Acciones", uid: "acciones" },
    ];

    const cargarIncidentes = useCallback(async () => {
        try {
            await listarIncidentes();
        } catch (error) {
            Toast.error('Error', 'No se pudieron cargar los incidentes');
        }
    }, [listarIncidentes]);

    // Cargar incidentes solo cuando la sesión esté lista
    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            cargarIncidentes();
        }
    }, [status, session, cargarIncidentes]);

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Formatear datos para la tabla
    const datosFormateados = useMemo(() => {
        return incidentes.map(incidente => {
            // Obtener nombre completo del reportante
            let nombreCompleto = 'Desconocido';
            let emailReportante = '';
            
            if (incidente.creadorUsuario?.profesor) {
                const prof = incidente.creadorUsuario.profesor;
                nombreCompleto = `${prof.nombre} ${prof.apellidoUno} ${prof.apellidoDos || ''}`.trim();
                emailReportante = incidente.creadorUsuario.nombreUsuario;
            } else if (incidente.creadorUsuario?.estudiante) {
                const est = incidente.creadorUsuario.estudiante;
                nombreCompleto = `${est.nombre} ${est.apellidoUno} ${est.apellidoDos || ''}`.trim();
                emailReportante = incidente.creadorUsuario.nombreUsuario;
            } else if (incidente.creadorUsuario?.nombreUsuario) {
                emailReportante = incidente.creadorUsuario.nombreUsuario;
            }

            return {
                ...incidente,
                casillero: incidente.casillero?.numCasillero || 'N/A',
                reportanteNombre: nombreCompleto, // Agregar campo buscable
                reportanteEmail: emailReportante, // Agregar campo buscable
                reportante: (
                    <div className="flex flex-col">
                        <span className="text-sm">{nombreCompleto}</span>
                        {emailReportante && (
                            <span className="text-xs text-gray-500">{emailReportante}</span>
                        )}
                    </div>
                ),
                detalle: incidente.detalle ? (
                    <Tooltip 
                        content={incidente.detalle} 
                        placement="top"
                        className="max-w-md"
                    >
                        <div className="max-w-xs truncate text-sm cursor-help">
                            {incidente.detalle}
                        </div>
                    </Tooltip>
                ) : (
                    <span className="text-gray-400 text-sm">Sin detalle</span>
                ),
                estadoTexto: obtenerTextoEstado(incidente.idEstadoIncidente), // Para el filtro
                estadoChip: ( // Renderizado personalizado del chip
                    <Chip
                        color={obtenerColorEstado(incidente.idEstadoIncidente)}
                        variant="flat"
                        size="sm"
                    >
                        {obtenerTextoEstado(incidente.idEstadoIncidente)}
                    </Chip>
                ),
                fechaCreacion: formatearFecha(incidente.fechaCreacion)
            };
        });
    }, [incidentes]);

    // Opciones de filtro para la tabla
    const filterOptions = [
        { 
            field: "estadoTexto", 
            label: "Estado", 
            values: Object.values(ESTADOS_INCIDENTE).map(id => obtenerTextoEstado(id))
        }
    ];

    const handleRevisar = (item) => {
        if (!item?.idIncidente) return;

        setAccion(ACCIONES_DRAWER.REVISAR);
        // Obtener el incidente completo de los datos que ya tenemos
        const incidenteCompleto = incidentes.find(inc => inc.idIncidente === item.idIncidente);
        setSelectedItem(incidenteCompleto);
        onOpen();
    };

    const handleVerDetalle = (item) => {
        if (!item?.idIncidente) return;
        setAccion(ACCIONES_DRAWER.DETALLE);
        setSelectedItem(item);
        onOpen();
    };

    const handleSuccessCreacion = (resultado) => {
        // Recargar la lista de incidentes
        cargarIncidentes();
    };

    // Función que se ejecuta cuando se hace clic en el botón del drawer
    const handleBotonPrimario = () => {
        if (accion === ACCIONES_DRAWER.CREAR && formularioCreacionRef.current) {
            formularioCreacionRef.current.handleSubmit();
        } else if (accion === ACCIONES_DRAWER.REVISAR && formularioRevisionRef.current) {
            formularioRevisionRef.current.handleSubmit();
        }
    };

    const accionesTabla = [
        {
            tooltip: "Ver detalles",
            icon: <FiEye size={18} />,
            handler: handleVerDetalle,
        },
        {
            tooltip: "Revisar",
            icon: <PiNotePencilFill size={18} />,
            handler: handleRevisar,
        },
    ];

    // Si no hay sesión, no mostrar nada (el middleware debería redirigir)
    if (status === 'loading' || !session?.user) {
        return null;
    }

    return (
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-8 px-4">
            <div className="w-full">
                <CabezeraDinamica
                    title="Lista de incidentes"
                    breadcrumb="Inicio • Lista de Incidentes"
                />
            </div>
            
            <div className="w-full">
                <TablaDinamica
                    columns={columnas}
                    data={datosFormateados}
                    acciones={accionesTabla}
                    filterOptions={filterOptions}
                    onOpen={onOpen}
                    setAccion={setAccion}
                    mostrarAcciones={true}
                    loading={loading}
                />

                <DrawerGeneral
                    titulo={
                        accion === ACCIONES_DRAWER.REVISAR
                            ? "Revisión de Incidente" 
                            : accion === ACCIONES_DRAWER.DETALLE
                            ? "Detalles del Incidente"
                            : "Reportar Incidente"
                    }
                    size={"3xl"}
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    textoBotonPrimario={accion === ACCIONES_DRAWER.REVISAR ? "Actualizar" : "Reportar"}
                    mostrarBotones={accion !== ACCIONES_DRAWER.DETALLE}
                    onBotonPrimario={handleBotonPrimario}
                    onBotonSecundario={() => onOpenChange(false)}
                >
                    {accion === ACCIONES_DRAWER.REVISAR ? (
                        <FormularioRevision
                            ref={formularioRevisionRef}
                            selectedItem={selectedItem}
                        />
                    ) : accion === ACCIONES_DRAWER.DETALLE ? (
                        <DetalleIncidente
                            incidenteId={selectedItem?.idIncidente}
                        />
                    ) : accion === ACCIONES_DRAWER.CREAR ? (
                        <FormularioCreacion
                            ref={formularioCreacionRef}
                            onSuccess={handleSuccessCreacion}
                            onClose={() => onOpenChange(false)}
                        />
                    ) : null}
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default ListaIncidentes;