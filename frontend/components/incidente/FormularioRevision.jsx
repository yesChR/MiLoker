import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Divider, Spinner, Select, SelectItem, Input, Button } from "@heroui/react";
import Carousel from "react-multi-carousel";
import Image from "next/image";
import { AiOutlinePlus } from "react-icons/ai";
import { useFormularioRevision } from "../../hooks/useFormularioRevision";
import { useSanciones } from "../../hooks/useSanciones";
import { obtenerTextoEstado, ESTADOS_INCIDENTE, obtenerEstadosSiguientes, TIPOS_INVOLUCRAMIENTO } from "../../utils/incidenteConstants";
import { ROLES } from "../../utils/rolesConstants";
import { Toast } from "../CustomAlert";
import { descargarEvidencia } from "../../services/evidenciaService";

const FormularioRevision = forwardRef(({ selectedItem, loading: loadingProp }, ref) => {
    const {
        loading: loadingHook,
        detalles,
        solucion,
        setSolucion,
        estadoSeleccionado,
        setEstadoSeleccionado,
        sancionSeleccionada,
        setSancionSeleccionada,
        observaciones,
        setObservaciones,
        actualizarEstado,
        verificarPermisos
    } = useFormularioRevision(selectedItem?.idIncidente);

    // Obtener sanciones dinámicamente
    const { sanciones, loading: loadingSanciones } = useSanciones();

    // Combinar loading del prop y del hook
    const loading = loadingProp || loadingHook;
    const [evidenciasExistentes, setEvidenciasExistentes] = useState([]); // Evidencias ya guardadas (URLs)
    const [nuevasEvidencias, setNuevasEvidencias] = useState([]); // Archivos nuevos a subir
    const [detalleEditable, setDetalleEditable] = useState(selectedItem?.detalle || ''); // Estado para el detalle editable

    // Combinar evidencias existentes con las nuevas para mostrar
    const todasLasEvidencias = [
        ...evidenciasExistentes,
        ...nuevasEvidencias.map(file => URL.createObjectURL(file))
    ];

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
            setDetalleEditable(detalles.detalle || '');
            setEvidenciasExistentes(detalles.evidencia || []); // Solo evidencias existentes
            setNuevasEvidencias([]); // Limpiar nuevas evidencias
        }
    }, [detalles]);

    // Cleanup: Liberar URLs temporales cuando el componente se desmonte
    useEffect(() => {
        return () => {
            nuevasEvidencias.forEach(file => {
                if (file instanceof File) {
                    const url = URL.createObjectURL(file);
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [nuevasEvidencias]);

    const handleAddImage = (event) => {
        const files = Array.from(event.target.files);
        // Solo agregar los archivos reales, no crear URLs aquí
        setNuevasEvidencias((prev) => [...prev, ...files]);
    };

    const handleDescargarEvidencia = async (evidencia, index) => {
        // Si es una URL temporal (blob:), no se puede descargar
        if (typeof evidencia === 'string' && evidencia.startsWith('blob:')) {
            Toast.error('No disponible', 'Esta evidencia aún no ha sido guardada. Guarda el incidente primero.');
            return;
        }

        const resultado = await descargarEvidencia(evidencia);
        if (resultado.error) {
            Toast.error('Error', resultado.message);
        }
    };

    // Datos a mostrar (del hook o del prop)
    const datosAMostrar = detalles || selectedItem;

    // Obtener permisos del hook
    const permisos = verificarPermisos();

    // Exponer la función actualizarEstado al componente padre
    useImperativeHandle(ref, () => ({
        handleSubmit: async () => {
            if (permisos.puedeEditar) {
                // Validar sanción obligatoria para ciertos estados
                if ([ESTADOS_INCIDENTE.EN_INVESTIGACION, ESTADOS_INCIDENTE.EN_PROCESO, ESTADOS_INCIDENTE.RESUELTO].includes(estadoSeleccionado)) {
                    if (!sancionSeleccionada && !detalles?.idSancion) {
                        Toast.error('Validación', 'Debe seleccionar una sanción para cambiar a este estado');
                        return;
                    }
                }
                
                // Validar solución obligatoria para estado RESUELTO
                if (estadoSeleccionado === ESTADOS_INCIDENTE.RESUELTO && !solucion?.trim()) {
                    Toast.error('Validación', 'La solución es obligatoria para marcar el incidente como resuelto');
                    return;
                }
                
                await actualizarEstado(detalleEditable, nuevasEvidencias);
            }
        }
    }), [permisos.puedeEditar, actualizarEstado, detalleEditable, nuevasEvidencias, estadoSeleccionado, sancionSeleccionada, detalles, solucion]);

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
                    <h3 className="mb-2">Demandante</h3>
                    <div className="text-gray-600 text-sm space-y-2">
                        <p>Nombre: {datosAMostrar.demandante?.nombre || 'N/A'}</p>
                        <p>Sección: {datosAMostrar.demandante?.seccion || 'N/A'}</p>
                        <p>Teléfono: {datosAMostrar.demandante?.telefono || 'N/A'}</p>
                        <p className="break-words">Correo: {datosAMostrar.demandante?.correo || 'N/A'}</p>
                    </div>
                </div>
                <div>
                    <h3 className="mb-2">Responsable</h3>
                    <div className="text-gray-600 text-sm space-y-2">
                        {datosAMostrar.responsable ? (
                            <>
                                <p>Nombre: {datosAMostrar.responsable.nombre}</p>
                                <p>Sección: {datosAMostrar.responsable.seccion}</p>
                                <p>Teléfono: {datosAMostrar.responsable.telefono}</p>
                                <p className="break-words">Correo: {datosAMostrar.responsable.correo}</p>
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
                    <h3 className="mb-2">Encargados</h3>
                    {datosAMostrar?.encargados && datosAMostrar.encargados.length > 0 ? (
                        <div className="space-y-3">
                            {datosAMostrar.encargados.map((encargado, index) => (
                                <div key={index} className="text-gray-600 text-sm">
                                    <p className="text-gray-800">{encargado.parentesco}: {encargado.nombre}</p>
                                    <p className="text-xs mt-1">Teléfono: {encargado.telefono}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm italic">No hay encargados registrados</p>
                    )}
                </div>
                <div>
                    <h3 className="mb-2">Descripción del Suceso</h3>
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
                <h3 className="mb-2">Evidencias</h3>
                {todasLasEvidencias && todasLasEvidencias.length > 0 ? (
                    <Carousel
                        responsive={responsive}
                        showDots={true}
                        swipeable={true}
                        customDot={<CustomDot />}
                        dotListClass="custom-dot-list-style"
                        containerClass="pb-8"
                    >
                        {todasLasEvidencias.map((src, index) => (
                            <div key={index} className="p-2 relative group">
                                <Image
                                    width={400}
                                    lazyBoundary="200px"
                                    height={300}
                                    src={src}
                                    alt={`Evidencia ${index + 1}`}
                                    className="w-full h-64 object-contain rounded-lg border shadow-md bg-gray-50"
                                />
                                <button
                                    onClick={() => handleDescargarEvidencia(src, index)}
                                    className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                                    title="Descargar evidencia"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <div className="p-2">
                            <div className="p-2 flex items-center justify-center border-2 border-dashed border-blue-300 rounded-lg shadow-md h-64">
                                <label className="flex flex-col items-center space-y-4 cursor-pointer">
                                    <AiOutlinePlus className="text-blue-400 w-16 h-16" />
                                    <span className="text-blue-400 text-lg">Agregar</span>
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
            {permisos.puedeEditar ? (
                <div>
                    <h3 className="mb-2">Actualizar Incidente</h3>
                    <div className="space-y-4">
                        {/* Estado actual mejorado */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-md p-4">
                            <p className="text-sm">
                                <span className="text-gray-600">Estado actual:</span>
                                <span className="ml-2 text-blue-700">{obtenerTextoEstado(datosAMostrar?.idEstadoIncidente)}</span>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm text-gray-700">Cambiar estado a</label>
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

                        {/* Selector de Sanción - Obligatorio para estados EN_INVESTIGACION, EN_PROCESO, RESUELTO */}
                        {[ESTADOS_INCIDENTE.EN_INVESTIGACION, ESTADOS_INCIDENTE.EN_PROCESO, ESTADOS_INCIDENTE.RESUELTO].includes(estadoSeleccionado) && (
                            <div className="space-y-2">
                                <label className="block text-sm text-gray-700">
                                    Sanción/Gravedad <span className="text-red-500">*</span>
                                </label>
                                {loadingSanciones ? (
                                    <div className="flex justify-center py-4">
                                        <Spinner size="sm" />
                                    </div>
                                ) : (
                                    <Select
                                        placeholder="Seleccione la gravedad de la sanción..."
                                        variant="bordered"
                                        color="primary"
                                        selectedKeys={sancionSeleccionada ? [sancionSeleccionada.toString()] : []}
                                        onChange={(e) => setSancionSeleccionada(Number(e.target.value))}
                                        isRequired
                                        description={sancionSeleccionada && sanciones.find(s => s.idSancion === sancionSeleccionada)?.detalle}
                                    >
                                        {sanciones.map((sancion) => (
                                            <SelectItem key={sancion.idSancion} value={sancion.idSancion}>
                                                {sancion.gravedad}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}
                                {!sancionSeleccionada && estadoSeleccionado && (
                                    <p className="text-xs text-red-500">La sanción es obligatoria para este estado</p>
                                )}
                            </div>
                        )}

                        {/* Mostrar sanción actual si existe */}
                        {detalles?.idSancion && !estadoSeleccionado && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-md p-4">
                                <p className="text-sm">
                                    <span className="text-gray-600">Sanción actual:</span>
                                    <span className="ml-2 text-yellow-700 font-medium">
                                        {sanciones.find(s => s.idSancion === detalles.idSancion)?.gravedad || 'N/A'}
                                    </span>
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-sm text-gray-700">Observaciones</label>
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
                                <label className="block text-sm text-gray-700">Solución propuesta *</label>
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
                        <span>Información: </span>
                        <span>{permisos.mensaje}</span>
                    </p>
                </div>
            )}
        </div>
    );
});

FormularioRevision.displayName = 'FormularioRevision';

export default FormularioRevision;