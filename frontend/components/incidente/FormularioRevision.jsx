import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Divider, Spinner, Select, SelectItem, Input, Button } from "@heroui/react";
import { useSession } from "next-auth/react";
import Carousel from "react-multi-carousel";
import Image from "next/image";
import { AiOutlinePlus } from "react-icons/ai";
import { useFormularioRevision } from "../../hooks/useFormularioRevision";
import { obtenerTextoEstado, ESTADOS_INCIDENTE, obtenerEstadosSiguientes, TIPOS_INVOLUCRAMIENTO } from "../../utils/incidenteConstants";
import { ROLES } from "../../utils/rolesConstants";
import { Toast } from "../CustomAlert";
import { incidenteService } from "../../services/incidenteService";

const FormularioRevision = forwardRef(({ selectedItem, loading: loadingProp }, ref) => {
    const { data: session } = useSession();
    
    // Debug log para ver los datos que llegan
    console.log('FormularioRevision - selectedItem:', selectedItem);

    const {
        loading: loadingHook,
        detalles,
        solucion,
        setSolucion,
        estadoSeleccionado,
        setEstadoSeleccionado,
        observaciones,
        setObservaciones,
        actualizarEstado
    } = useFormularioRevision(selectedItem?.idIncidente);

    // Combinar loading del prop y del hook
    const loading = loadingProp || loadingHook;
    const [evidencias, setEvidencias] = useState(selectedItem?.evidencia || []); // Estado para las evidencias
    const [nuevasEvidencias, setNuevasEvidencias] = useState([]); // Archivos nuevos a subir
    const [detalleEditable, setDetalleEditable] = useState(selectedItem?.detalle || ''); // Estado para el detalle editable

    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 1024 },
            items: 2,
        },
        desktop: {
            breakpoint: { max: 1024, min: 768 },
            items: 2,
        },
        tablet: {
            breakpoint: { max: 768, min: 464 },
            items: 1,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
        },
    };

    const CustomDot = ({ onClick, active }) => {
        return (
            <li
                className={`w-3 h-3 rounded-full mx-1 cursor-pointer ${active ? "bg-blue-500" : "bg-gray-300"
                    }`}
                onClick={onClick}
            ></li>
        );
    };

    useEffect(() => {
        if (detalles) {
            setDetalleEditable(detalles.detalle || ''); // Inicializa el detalle editable con el valor actual
            setEvidencias(detalles.evidencia || []); // Inicializa las evidencias
        }
    }, [detalles]);

    const handleAddImage = (event) => {
        const files = Array.from(event.target.files);
        const newEvidenciasURLs = files.map((file) => URL.createObjectURL(file)); // Crear URLs temporales para preview
        setEvidencias((prev) => [...prev, ...newEvidenciasURLs]); // Agregar URLs para mostrar
        setNuevasEvidencias((prev) => [...prev, ...files]); // Guardar archivos reales para subir
    };

    // Calcular si puede editar (necesario para useImperativeHandle)
    const datosAMostrar = detalles || selectedItem;
    const esProfesor = session?.user?.role === ROLES.PROFESOR;
    const especialidadCasillero = datosAMostrar?.casillero?.armario?.idEspecialidad;
    const especialidadUsuario = session?.user?.idEspecialidad;
    
    // Si no hay casillero o no hay especialidad del casillero, cualquier profesor puede editar
    // Si hay casillero con especialidad, solo profesores de esa especialidad pueden editar
    const especialidadCoincide = !especialidadCasillero || especialidadCasillero === especialidadUsuario;
    const puedeEditar = esProfesor && especialidadCoincide;

    // Debug detallado de permisos
    console.log('🔐 Verificación de permisos:');
    console.log('  - session?.user?.role:', session?.user?.role);
    console.log('  - ROLES.PROFESOR:', ROLES.PROFESOR);
    console.log('  - esProfesor:', esProfesor);
    console.log('  - especialidadCasillero:', especialidadCasillero);
    console.log('  - especialidadUsuario:', especialidadUsuario);
    console.log('  - especialidadCoincide:', especialidadCoincide);
    console.log('  - datosAMostrar?.casillero:', datosAMostrar?.casillero);
    console.log('  - puedeEditar:', puedeEditar);

    // Debug logs
    useEffect(() => {
        console.log('Estado actual:', {
            loading,
            selectedItem,
            detalles,
            estadoSeleccionado,
            puedeEditar
        });
    }, [loading, selectedItem, detalles, estadoSeleccionado, puedeEditar]);

    // Exponer la función actualizarEstado al componente padre
    useImperativeHandle(ref, () => ({
        handleSubmit: async () => {
            console.log('handleSubmit llamado, puedeEditar:', puedeEditar);
            if (puedeEditar) {
                await actualizarEstado(detalleEditable, nuevasEvidencias);
            }
        }
    }), [puedeEditar, actualizarEstado, detalleEditable, nuevasEvidencias]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    if (!datosAMostrar) {
        return <p className="text-center text-gray-600">No hay datos disponibles.</p>;
    }

    return (
        <div className="space-y-6 px-4 pb-10">
            {/* Sección: Demandante y Responsable */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold mb-2">Demandante</h3>
                    <div className="text-gray-600 text-sm space-y-2">
                        <p><span className="font-medium">Nombre:</span> {datosAMostrar.demandante?.nombre || 'N/A'}</p>
                        <p><span className="font-medium">Sección:</span> {datosAMostrar.demandante?.seccion || 'N/A'}</p>
                        <p><span className="font-medium">Teléfono:</span> {datosAMostrar.demandante?.telefono || 'N/A'}</p>
                        <p className="break-words"><span className="font-medium">Correo:</span> {datosAMostrar.demandante?.correo || 'N/A'}</p>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Responsable</h3>
                    <div className="text-gray-600 text-sm space-y-2">
                        {datosAMostrar.responsable ? (
                            <>
                                <p><span className="font-medium">Nombre:</span> {datosAMostrar.responsable.nombre}</p>
                                <p><span className="font-medium">Sección:</span> {datosAMostrar.responsable.seccion}</p>
                                <p><span className="font-medium">Teléfono:</span> {datosAMostrar.responsable.telefono}</p>
                                <p className="break-words"><span className="font-medium">Correo:</span> {datosAMostrar.responsable.correo}</p>
                            </>
                        ) : (
                            <p className="text-gray-400 italic">Aún no identificado</p>
                        )}
                    </div>
                </div>
            </div>

            <Divider />

            {/* Sección: Encargados y Descripción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold mb-2">Encargados</h3>
                    {datosAMostrar?.encargados && datosAMostrar.encargados.length > 0 ? (
                        <div className="space-y-3">
                            {datosAMostrar.encargados.map((encargado, index) => (
                                <div key={index} className="text-gray-600 text-sm">
                                    <p className="font-medium text-gray-800">{encargado.parentesco}: {encargado.nombre}</p>
                                    <p className="text-xs mt-1">Teléfono: {encargado.telefono}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm italic">No hay encargados registrados</p>
                    )}
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Descripción del Suceso</h3>
                    <textarea
                        className="w-full border border-gray-300 rounded-md p-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows="6"
                        value={detalleEditable}
                        onChange={(e) => setDetalleEditable(e.target.value)}
                        placeholder="Escribe la descripción detallada del suceso..."
                    />
                </div>
            </div>
            <Divider />

            {/* Sección: Evidencias */}
            <div>
                <h3 className="font-semibold mb-2">Evidencias</h3>
                {evidencias && evidencias.length > 0 ? (
                    <Carousel
                        responsive={responsive}
                        showDots={true}
                        swipeable={true}
                        customDot={<CustomDot />}
                        dotListClass="custom-dot-list-style"
                        containerClass="pb-8"
                    >
                        {evidencias.map((src, index) => (
                            <div key={index} className="p-2">
                                <Image
                                    width={400}
                                    lazyBoundary="200px"
                                    height={300}
                                    src={src}
                                    alt={`Evidencia ${index + 1}`}
                                    className="w-full h-64 object-contain rounded-lg border shadow-md bg-gray-50"
                                />
                            </div>
                        ))}
                        <div className="p-2">
                            <div className="p-2 flex items-center justify-center border-2 border-dashed border-blue-300 rounded-lg shadow-md h-64">
                                <label className="flex flex-col items-center space-y-4 cursor-pointer">
                                    <AiOutlinePlus className="text-blue-400 w-16 h-16" />
                                    <span className="text-blue-400 text-lg font-semibold">Agregar</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleAddImage}
                                    />
                                </label>
                            </div>
                        </div>
                    </Carousel>
                ) : (
                    <p className="text-gray-400 text-sm italic">No hay evidencias disponibles</p>
                )}
            </div>

            <Divider />
            {/* Sección: Actualización de Estado */}
            {puedeEditar ? (
                <div>
                    <h3 className="font-semibold mb-2">Actualizar Incidente</h3>
                    <div className="space-y-4">
                        {/* Estado actual mejorado */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-md p-4">
                            <p className="text-sm">
                                <span className="text-gray-600 font-medium">Estado actual:</span>
                                <span className="ml-2 text-blue-700 font-semibold">{obtenerTextoEstado(datosAMostrar?.idEstadoIncidente)}</span>
                            </p>
                        </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Cambiar estado a</label>
                                <Select
                                    placeholder="Seleccione el nuevo estado..."
                                    variant="bordered"
                                    color="primary"
                                    selectedKeys={estadoSeleccionado ? [estadoSeleccionado.toString()] : []}
                                    onChange={(e) => setEstadoSeleccionado(Number(e.target.value))}
                                >
                                    {obtenerEstadosSiguientes(datosAMostrar?.idEstadoIncidente).map((estadoId) => (
                                        <SelectItem key={estadoId} value={estadoId}>
                                            {obtenerTextoEstado(estadoId)}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                                <textarea
                                    className="w-full border rounded-lg p-3 text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    rows="3"
                                    placeholder="Agregue observaciones sobre el cambio de estado..."
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                />
                            </div>

                            {/* Mostrar campo de solución solo si el estado seleccionado es RESUELTO */}
                            {estadoSeleccionado === ESTADOS_INCIDENTE.RESUELTO && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Solución propuesta *</label>
                                    <textarea
                                        className="w-full border rounded-lg p-3 text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        rows="4"
                                        placeholder="Describa la solución planteada..."
                                        value={solucion}
                                        onChange={(e) => setSolucion(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500">Este campo es obligatorio para marcar el incidente como resuelto</p>
                                </div>
                            )}
                    </div>
                </div>
            ) : (
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-md p-4">
                    <p className="text-sm text-blue-800">
                        <span className="font-semibold">Información:</span>
                        <span className="ml-2">
                            {!esProfesor ? (
                                'Solo los profesores pueden actualizar el estado de los incidentes'
                            ) : (
                                'Solo profesores de la misma especialidad pueden actualizar este incidente'
                            )}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
});

FormularioRevision.displayName = 'FormularioRevision';

export default FormularioRevision;