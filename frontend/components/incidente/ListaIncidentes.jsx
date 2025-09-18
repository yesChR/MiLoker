import React, { useState, useEffect, useRef } from "react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import DrawerGeneral from "../DrawerGeneral";
import { useDisclosure, Chip } from "@heroui/react";
import { PiNotePencilFill } from "react-icons/pi";
import "react-multi-carousel/lib/styles.css";
import FormularioRevision from "./FormularioRevision";
import FormularioCreacion from "./FormularioCreacion";
import { useIncidentes } from "../../hooks/useIncidentes";
import { obtenerTextoEstado, obtenerColorEstado } from "../../utils/incidenteConstants";

const ListaIncidentes = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { incidentes, listarIncidentes, loading, error } = useIncidentes();
    
    const [selectedItem, setSelectedItem] = useState(null);
    const [accion, setAccion] = useState(""); // "revisar" o "crear"
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [detalleEditable, setDetalleEditable] = useState("");
    
    // Referencia al formulario de creación
    const formularioRef = useRef(null);

    const columnas = [
        { name: "ID", uid: "idIncidente" },
        { name: "Casillero", uid: "casillero" },
        { name: "Reportado por", uid: "reportante" },
        { name: "Detalle", uid: "detalle" },
        { name: "Estado", uid: "estado" },
        { name: "Fecha", uid: "fechaCreacion" },
        { name: "Acciones", uid: "acciones" },
    ];

    // Cargar incidentes al montar el componente
    useEffect(() => {
        cargarIncidentes();
    }, []);

    const cargarIncidentes = async () => {
        try {
            await listarIncidentes();
        } catch (error) {
            console.error("Error cargando incidentes:", error);
        }
    };

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
    const datosFormateados = incidentes.map(incidente => ({
        ...incidente,
        casillero: incidente.casillero?.numCasillero || 'N/A',
        reportante: incidente.creadorUsuario?.nombreUsuario || 'Desconocido',
        detalle: incidente.detalle?.length > 50 
            ? `${incidente.detalle.substring(0, 50)}...` 
            : incidente.detalle,
        estado: (
            <Chip 
                color={obtenerColorEstado(incidente.idEstadoIncidente)}
                variant="flat"
                size="sm"
            >
                {obtenerTextoEstado(incidente.idEstadoIncidente)}
            </Chip>
        ),
        fechaCreacion: formatearFecha(incidente.fechaCreacion)
    }));

    const handleRevisar = async (item) => {
        setAccion("revisar");
        setLoadingDetalle(true);
        setSelectedItem(null);
        onOpen();

        try {
            // Aquí podrías hacer una llamada para obtener más detalles del incidente
            // Por ahora usamos los datos que ya tenemos
            const incidenteCompleto = incidentes.find(inc => inc.idIncidente === item.idIncidente);
            
            // Simular carga de datos adicionales
            setTimeout(() => {
                setSelectedItem({
                    ...incidenteCompleto,
                    // Datos simulados para demostrar - reemplazar con datos reales
                    demandante: {
                        nombre: incidenteCompleto.creadorUsuario?.nombreUsuario || "Usuario",
                        seccion: "8-2",
                        telefono: "8888-8888",
                        correo: "usuario@ejemplo.com"
                    },
                    responsable: {
                        nombre: "Por determinar",
                        seccion: "N/A",
                        telefono: "N/A",
                        correo: "N/A"
                    },
                    encargados: [
                        { parentesco: "Padre", nombre: "Padre Ejemplo", telefono: "8888-1111" },
                        { parentesco: "Madre", nombre: "Madre Ejemplo", telefono: "8888-2222" }
                    ],
                    evidencia: [
                        "/casillero_dañado.jpg" // Imagen de ejemplo
                    ]
                });
                setDetalleEditable(incidenteCompleto.detalle || "");
                setLoadingDetalle(false);
            }, 500);
        } catch (error) {
            console.error("Error cargando detalles:", error);
            setLoadingDetalle(false);
        }
    };

    const handleCrearNuevo = () => {
        setAccion("crear");
        setSelectedItem(null);
        onOpen();
    };

    const handleSuccessCreacion = (resultado) => {
        // Recargar la lista de incidentes
        cargarIncidentes();
    };

    // Función que se ejecuta cuando se hace clic en el botón del drawer
    const handleBotonPrimario = () => {
        if (formularioRef.current) {
            formularioRef.current.handleSubmit();
        }
    };

    const accionesTabla = [
        {
            tooltip: "Revisar",
            icon: <PiNotePencilFill size={18} />,
            handler: handleRevisar,
        },
    ];

    if (error) {
        return (
            <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
                <div className="w-full">
                    <CabezeraDinamica
                        title="Lista de incidentes"
                        breadcrumb="Inicio • Lista de Incidentes"
                    />
                </div>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-full max-w-4xl">
                    Error al cargar incidentes: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Lista de incidentes"
                    breadcrumb="Inicio • Lista de Incidentes"
                />
            </div>
            
            <div className="w-full max-w-4xl">
                <TablaDinamica
                    columns={columnas}
                    data={datosFormateados}
                    acciones={accionesTabla}
                    mostrarAcciones={true}
                    onOpen={onOpen}
                    setAccion={setAccion}
                    isLoading={loading}
                    emptyContent="No hay incidentes registrados"
                    // Agregar botón para crear nuevo incidente
                    topContent={
                        <div className="flex justify-end">
                            <button
                                onClick={handleCrearNuevo}
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                            >
                                Reportar Nuevo Incidente
                            </button>
                        </div>
                    }
                />

                <DrawerGeneral
                    titulo={accion === "revisar" ? "Revisión de Incidente" : "Reportar Incidente"}
                    size={accion === "revisar" ? "3xl" : "xl"}
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    textoBotonPrimario={accion === "revisar" ? "Actualizar" : "Reportar"}
                    showFooter={accion === "crear"}
                    onBotonPrimario={handleBotonPrimario}
                >
                    {accion === "revisar" ? (
                        <FormularioRevision
                            loading={loadingDetalle}
                            selectedItem={selectedItem}
                            detalleEditable={detalleEditable}
                            setDetalleEditable={setDetalleEditable}
                        />
                    ) : (
                        <FormularioCreacion
                            ref={formularioRef} // ← NUEVA REFERENCIA
                            onSuccess={handleSuccessCreacion}
                            onClose={() => onOpenChange(false)}
                        />
                    )}
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default ListaIncidentes;