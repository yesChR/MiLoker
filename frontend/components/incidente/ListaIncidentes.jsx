import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import DrawerGeneral from "../DrawerGeneral";
import { useDisclosure, Chip, Spinner, Select, SelectItem } from "@heroui/react";
import { PiNotePencilFill } from "react-icons/pi";
import "react-multi-carousel/lib/styles.css";
import FormularioRevision from "./FormularioRevision";
import FormularioCreacion from "./FormularioCreacion";
import { useIncidentes } from "../../hooks/useIncidentes";
import { obtenerTextoEstado, obtenerColorEstado, ESTADOS_INCIDENTE } from "../../utils/incidenteConstants";

const ListaIncidentes = () => {
    const { data: session, status } = useSession();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { incidentes, listarIncidentes, loading, error } = useIncidentes();
    
    const [selectedItem, setSelectedItem] = useState(null);
    const [accion, setAccion] = useState(""); // "revisar" o "crear"
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [detalleEditable, setDetalleEditable] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos"); // Filtro de estado
    
    // Referencias a los formularios
    const formularioCreacionRef = useRef(null);
    const formularioRevisionRef = useRef(null);

    const columnas = [
        { name: "Casillero", uid: "casillero" },
        { name: "Reportado por", uid: "reportante" },
        { name: "Detalle", uid: "detalle" },
        { name: "Estado", uid: "estado" },
        { name: "Fecha", uid: "fechaCreacion" },
        { name: "Acciones", uid: "acciones" },
    ];

    // Cargar incidentes solo cuando la sesión esté lista
    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            cargarIncidentes();
        }
    }, [status, session]);

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
    const datosFormateados = useMemo(() => {
        // Filtrar por estado si no es "todos"
        const incidentesFiltrados = filtroEstado === "todos" 
            ? incidentes 
            : incidentes.filter(inc => inc.idEstadoIncidente === parseInt(filtroEstado));
        
        return incidentesFiltrados.map(incidente => ({
            ...incidente,
            casillero: incidente.casillero?.numCasillero || 'N/A',
            reportante: incidente.creadorUsuario?.nombreUsuario || 'Desconocido',
            detalle: incidente.detalle?.length > 50 
                ? `${incidente.detalle.substring(0, 50)}...` 
                : incidente.detalle,
            estado: obtenerTextoEstado(incidente.idEstadoIncidente),
            fechaCreacion: formatearFecha(incidente.fechaCreacion)
        }));
    }, [incidentes, filtroEstado]);

    const handleRevisar = async (item) => {
        if (!item?.idIncidente) {
            console.error('No se proporcionó un ID de incidente válido');
            return;
        }

        setAccion("revisar");
        setLoadingDetalle(true);
        
        try {
            // Obtener el incidente completo de los datos que ya tenemos
            const incidenteCompleto = incidentes.find(inc => inc.idIncidente === item.idIncidente);
            if (!incidenteCompleto) {
                throw new Error('No se encontró el incidente');
            }
            
            console.log('Incidente seleccionado:', incidenteCompleto); // Debug log
            setSelectedItem(incidenteCompleto); // Establecer el incidente seleccionado
            onOpen(); // Abrir el drawer después de tener los datos
        } catch (error) {
            console.error("Error cargando detalles:", error);
            Toast.error('Error', 'No se pudieron cargar los detalles del incidente');
        } finally {
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
        console.log('🔵 handleBotonPrimario llamado');
        console.log('  - accion:', accion);
        console.log('  - formularioCreacionRef.current:', formularioCreacionRef.current);
        console.log('  - formularioRevisionRef.current:', formularioRevisionRef.current);
        
        if (accion === "crear" && formularioCreacionRef.current) {
            console.log('✅ Llamando a handleSubmit de FormularioCreacion');
            formularioCreacionRef.current.handleSubmit();
        } else if (accion === "revisar" && formularioRevisionRef.current) {
            console.log('✅ Llamando a handleSubmit de FormularioRevision');
            formularioRevisionRef.current.handleSubmit();
        } else {
            console.warn('⚠️ No se pudo ejecutar handleSubmit:', {
                accion,
                tieneCreacionRef: !!formularioCreacionRef.current,
                tieneRevisionRef: !!formularioRevisionRef.current
            });
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

    // Mostrar loading mientras se autentica
    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Spinner size="lg" label="Cargando..." />
            </div>
        );
    }

    // Si no hay sesión, no mostrar nada (el middleware debería redirigir)
    if (!session?.user) {
        return null;
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
                    isLoading={loading}
                    emptyContent="No hay incidentes registrados"
                    // Agregar filtro y botón para crear nuevo incidente
                    topContent={
                        <div className="flex justify-between items-center gap-4">
                            <Select
                                label="Filtrar por estado"
                                placeholder="Todos los estados"
                                className="max-w-xs"
                                selectedKeys={[filtroEstado]}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                            >
                                <SelectItem key="todos" value="todos">
                                    Todos los estados
                                </SelectItem>
                                {Object.entries(ESTADOS_INCIDENTE).map(([key, value]) => (
                                    <SelectItem key={value.toString()} value={value.toString()}>
                                        {obtenerTextoEstado(value)}
                                    </SelectItem>
                                ))}
                            </Select>
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
                    mostrarBotones={true}
                    onBotonPrimario={handleBotonPrimario}
                    onBotonSecundario={() => onOpenChange(false)}
                >
                    {accion === "revisar" ? (
                        <FormularioRevision
                            ref={formularioRevisionRef}
                            loading={loadingDetalle}
                            selectedItem={selectedItem}
                            detalleEditable={detalleEditable}
                            setDetalleEditable={setDetalleEditable}
                        />
                    ) : (
                        <FormularioCreacion
                            ref={formularioCreacionRef}
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