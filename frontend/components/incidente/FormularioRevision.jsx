import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Divider, Spinner, Select, SelectItem, Input, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import Carousel from "react-multi-carousel";
import Image from "next/image";
import { AiOutlinePlus } from "react-icons/ai";
import { FiUserPlus } from "react-icons/fi";
import { useFormularioRevision } from "../../hooks/useFormularioRevision";
import { useSanciones } from "../../hooks/useSanciones";
import { obtenerTextoEstado, ESTADOS_INCIDENTE, obtenerEstadosSiguientes, TIPOS_INVOLUCRAMIENTO } from "../../utils/incidenteConstants";
import { ROLES } from "../../utils/rolesConstants";
import { Toast } from "../CustomAlert";
import { descargarEvidencia } from "../../services/evidenciaService";
import { agregarInvolucrado } from "../../services/incidenteService";
import { useSession } from "next-auth/react";

const FormularioRevision = forwardRef(({ selectedItem, loading: loadingProp, onSubmittingChange }, ref) => {
    const { data: session } = useSession();
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
    const [submitting, setSubmitting] = useState(false); // Estado local para prevenir múltiples envíos
    const [evidenciasExistentes, setEvidenciasExistentes] = useState([]); // Evidencias ya guardadas (URLs)
    const [nuevasEvidencias, setNuevasEvidencias] = useState([]); // Archivos nuevos a subir
    const [detalleEditable, setDetalleEditable] = useState(selectedItem?.detalle || ''); // Estado para el detalle editable
    
    // Estados para modal de agregar involucrado
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [cedulaInvolucrado, setCedulaInvolucrado] = useState('');
    const [tipoInvolucrado, setTipoInvolucrado] = useState('');
    const [seccionInvolucrado, setSeccionInvolucrado] = useState('');
    const [agregandoInvolucrado, setAgregandoInvolucrado] = useState(false);

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

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDragEnter = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const files = Array.from(event.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            setNuevasEvidencias((prev) => [...prev, ...imageFiles]);
            Toast.success('Evidencias agregadas', `${imageFiles.length} ${imageFiles.length === 1 ? 'imagen agregada' : 'imágenes agregadas'}`);
        } else {
            Toast.warning('Archivos no válidos', 'Solo se permiten archivos de imagen');
        }
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

    // Función para agregar involucrado
    const handleAgregarInvolucrado = async () => {
        if (!cedulaInvolucrado || !tipoInvolucrado || !seccionInvolucrado) {
            Toast.warning('Validación', 'Todos los campos son requeridos');
            return;
        }

        if (!session?.user?.id) {
            Toast.error('Error', 'No se pudo obtener la información del usuario');
            return;
        }

        // Validar estado del incidente antes de enviar
        if (detalles?.idEstadoIncidente !== ESTADOS_INCIDENTE.EN_INVESTIGACION) {
            Toast.error(
                'Estado incorrecto', 
                'El incidente debe estar en estado "En Investigación" para agregar involucrados. Primero cambia el estado del incidente.'
            );
            return;
        }

        setAgregandoInvolucrado(true);
        try {
            await agregarInvolucrado(selectedItem?.idIncidente, {
                cedulaEstudiante: cedulaInvolucrado,
                tipoInvolucramiento: parseInt(tipoInvolucrado),
                seccion: seccionInvolucrado,
                cedulaUsuario: session.user.id
            });

            Toast.success('Éxito', 'Estudiante agregado como involucrado');
            
            // Limpiar formulario
            setCedulaInvolucrado('');
            setTipoInvolucrado('');
            setSeccionInvolucrado('');
            onOpenChange(false);
            
            // Recargar detalles (puedes agregar una función para esto en el hook)
            window.location.reload(); // Temporal - idealmente recargar solo los detalles
        } catch (error) {
            Toast.error('Error', error.message || 'No se pudo agregar el involucrado');
        } finally {
            setAgregandoInvolucrado(false);
        }
    };

    // Datos a mostrar (del hook o del prop)
    const datosAMostrar = detalles || selectedItem;

    // Obtener permisos del hook
    const permisos = verificarPermisos();

    // Notificar al padre cuando cambie el estado de submitting
    useEffect(() => {
        if (onSubmittingChange) {
            onSubmittingChange(submitting);
        }
    }, [submitting, onSubmittingChange]);

    // Exponer la función actualizarEstado al componente padre
    useImperativeHandle(ref, () => ({
        handleSubmit: async () => {
            if (submitting) return { success: false }; // Prevenir múltiples envíos
            
            if (permisos.puedeEditar) {
                // Validar sanción obligatoria para EN_INVESTIGACION y RESUELTO
                // CERRADO NO requiere sanción (puede ser caso que no procede)
                if ([ESTADOS_INCIDENTE.EN_INVESTIGACION, ESTADOS_INCIDENTE.RESUELTO].includes(estadoSeleccionado)) {
                    if (!sancionSeleccionada && !detalles?.idSancion) {
                        Toast.error('Validación', 'Debe seleccionar una sanción para cambiar a este estado');
                        return { success: false };
                    }
                }
                
                // Validar solución obligatoria para estado RESUELTO
                if (estadoSeleccionado === ESTADOS_INCIDENTE.RESUELTO && !solucion?.trim()) {
                    Toast.error('Validación', 'La solución es obligatoria para marcar el incidente como resuelto');
                    return { success: false };
                }
                
                setSubmitting(true);
                try {
                    const resultado = await actualizarEstado(detalleEditable, nuevasEvidencias);
                    return resultado;
                } finally {
                    setSubmitting(false);
                }
            }
            return { success: false };
        }
    }), [permisos.puedeEditar, actualizarEstado, detalleEditable, nuevasEvidencias, estadoSeleccionado, sancionSeleccionada, detalles, solucion, submitting]);

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
        <div className="space-y-5 px-4 pb-10">
            {/* Tarjeta: Reportante */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg shadow-sm">
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            R
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Reportante</h3>
                            <p className="text-xs text-gray-600">Persona que reportó el incidente</p>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">Nombre completo</p>
                                <p className="text-sm text-gray-900">{datosAMostrar.demandante?.nombre || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">Cédula</p>
                                <p className="text-sm text-gray-900">{datosAMostrar.demandante?.cedula || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">Sección</p>
                                <p className="text-sm text-gray-900">{datosAMostrar.demandante?.seccion || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">Teléfono</p>
                                <p className="text-sm text-gray-900">{datosAMostrar.demandante?.telefono || 'N/A'}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-xs text-gray-500 font-medium mb-1">Correo electrónico</p>
                                <p className="text-sm text-gray-900 break-words">{datosAMostrar.demandante?.correo || 'N/A'}</p>
                            </div>
                        </div>
                        
                        {/* Encargados del reportante */}
                        {datosAMostrar.demandante?.encargados && datosAMostrar.demandante.encargados.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500 font-semibold mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Encargados del estudiante
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {datosAMostrar.demandante.encargados.map((enc, idx) => (
                                        <div key={idx} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                            <p className="text-sm font-semibold text-gray-800">{enc.parentesco || 'N/A'}</p>
                                            <p className="text-xs text-gray-700 mt-1">{enc.nombre || `${enc.primerNombre || ''} ${enc.primerApellido || ''}`}</p>
                                            <p className="text-xs text-gray-600 mt-1">📞 {enc.telefono || 'N/A'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tarjeta: Responsable */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg shadow-sm">
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                            ⚠
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Responsable</h3>
                            <p className="text-xs text-gray-600">Estudiante que causó el daño</p>
                        </div>
                    </div>
                    
                    {datosAMostrar.responsable ? (
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">Nombre completo</p>
                                    <p className="text-sm text-gray-900">{datosAMostrar.responsable.nombre}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">Cédula</p>
                                    <p className="text-sm text-gray-900">{datosAMostrar.responsable.cedula}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">Sección</p>
                                    <p className="text-sm text-gray-900">{datosAMostrar.responsable.seccion}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">Teléfono</p>
                                    <p className="text-sm text-gray-900">{datosAMostrar.responsable.telefono}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Correo electrónico</p>
                                    <p className="text-sm text-gray-900 break-words">{datosAMostrar.responsable.correo}</p>
                                </div>
                            </div>
                            
                            {/* Encargados del responsable */}
                            {datosAMostrar.responsable.encargados && datosAMostrar.responsable.encargados.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 font-semibold mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Encargados del estudiante
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {datosAMostrar.responsable.encargados.map((enc, idx) => (
                                            <div key={idx} className="bg-red-50 p-3 rounded-lg border border-red-200">
                                                <p className="text-sm font-semibold text-gray-800">{enc.parentesco || 'N/A'}</p>
                                                <p className="text-xs text-gray-700 mt-1">{enc.nombre || `${enc.primerNombre || ''} ${enc.primerApellido || ''}`}</p>
                                                <p className="text-xs text-gray-600 mt-1">📞 {enc.telefono || 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg p-6 shadow-sm text-center border-2 border-dashed border-red-200">
                            <svg className="w-12 h-12 mx-auto text-red-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-500 font-medium">Responsable no identificado</p>
                            <p className="text-xs text-gray-400 mt-1">Haz clic en &ldquo;Identificar&rdquo; para agregar</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tarjeta: Afectado */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500 rounded-lg shadow-sm">
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Afectado</h3>
                            <p className="text-xs text-gray-600">Dueño del casillero dañado</p>
                        </div>
                    </div>
                    
                    {datosAMostrar.afectado ? (
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">Nombre completo</p>
                                    <p className="text-sm text-gray-900">{datosAMostrar.afectado.nombre}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">Cédula</p>
                                    <p className="text-sm text-gray-900">{datosAMostrar.afectado.cedula}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">Sección</p>
                                    <p className="text-sm text-gray-900">{datosAMostrar.afectado.seccion}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">Teléfono</p>
                                    <p className="text-sm text-gray-900">{datosAMostrar.afectado.telefono}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Correo electrónico</p>
                                    <p className="text-sm text-gray-900 break-words">{datosAMostrar.afectado.correo}</p>
                                </div>
                            </div>
                            
                            {/* Encargados del afectado */}
                            {datosAMostrar.afectado.encargados && datosAMostrar.afectado.encargados.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 font-semibold mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Encargados del estudiante
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {datosAMostrar.afectado.encargados.map((enc, idx) => (
                                            <div key={idx} className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                                <p className="text-sm font-semibold text-gray-800">{enc.parentesco || 'N/A'}</p>
                                                <p className="text-xs text-gray-700 mt-1">{enc.nombre || `${enc.primerNombre || ''} ${enc.primerApellido || ''}`}</p>
                                                <p className="text-xs text-gray-600 mt-1">📞 {enc.telefono || 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg p-6 shadow-sm text-center border-2 border-dashed border-orange-200">
                            <svg className="w-12 h-12 mx-auto text-orange-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-500 font-medium">Sin casillero asignado</p>
                            <p className="text-xs text-gray-400 mt-1">El casillero no tiene dueño registrado</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tarjeta: Testigos */}
            {datosAMostrar.testigos && datosAMostrar.testigos.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-100 border-l-4 border-indigo-500 rounded-lg shadow-sm">
                    <div className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                T
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800">Testigos</h3>
                                <p className="text-xs text-gray-600">
                                    {datosAMostrar.testigos.length} {datosAMostrar.testigos.length === 1 ? 'testigo' : 'testigos'} del incidente
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            {datosAMostrar.testigos.map((testigo, index) => (
                                <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800">Testigo #{index + 1}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1">Nombre completo</p>
                                            <p className="text-sm text-gray-900">{testigo.nombre}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1">Cédula</p>
                                            <p className="text-sm text-gray-900">{testigo.cedula}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1">Sección</p>
                                            <p className="text-sm text-gray-900">{testigo.seccion}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1">Teléfono</p>
                                            <p className="text-sm text-gray-900">{testigo.telefono}</p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <p className="text-xs text-gray-500 font-medium mb-1">Correo electrónico</p>
                                            <p className="text-sm text-gray-900 break-words">{testigo.correo}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Encargados del testigo */}
                                    {testigo.encargados && testigo.encargados.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <p className="text-xs text-gray-500 font-semibold mb-3 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Encargados del estudiante
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {testigo.encargados.map((enc, idx) => (
                                                    <div key={idx} className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                                                        <p className="text-sm font-semibold text-gray-800">{enc.parentesco || 'N/A'}</p>
                                                        <p className="text-xs text-gray-700 mt-1">{enc.nombre || `${enc.primerNombre || ''} ${enc.primerApellido || ''}`}</p>
                                                        <p className="text-xs text-gray-600 mt-1">📞 {enc.telefono || 'N/A'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Tarjeta: Descripción del Suceso */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-l-4 border-indigo-500 rounded-lg shadow-sm">
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800">Descripción del Suceso</h3>
                            <p className="text-xs text-gray-600">Detalles de lo ocurrido con el casillero</p>
                        </div>
                        {!permisos.puedeEditar && (
                            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Solo lectura
                            </span>
                        )}
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <textarea
                            className={`w-full border-2 rounded-lg p-4 text-gray-700 text-sm resize-none transition-all ${
                                permisos.puedeEditar 
                                    ? 'border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white' 
                                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            }`}
                            rows="6"
                            value={detalleEditable}
                            onChange={(e) => setDetalleEditable(e.target.value)}
                            disabled={!permisos.puedeEditar}
                            placeholder={permisos.puedeEditar ? "Escribe aquí los detalles del incidente: qué pasó, cuándo, cómo se descubrió el daño, etc..." : ""}
                        />
                        
                        {permisos.puedeEditar && (
                            <div className="flex items-center justify-between mt-3 text-xs">
                                <p className="text-gray-500 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Sé lo más específico posible
                                </p>
                                <p className="text-gray-400">
                                    {detalleEditable?.length || 0} caracteres
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Divider className="my-6" />

            {/* Tarjeta: Evidencias */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg shadow-sm">
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800">Evidencias</h3>
                            <p className="text-xs text-gray-600">Fotos y documentos del incidente</p>
                        </div>
                        {todasLasEvidencias && todasLasEvidencias.length > 0 && (
                            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                                {todasLasEvidencias.length} {todasLasEvidencias.length === 1 ? 'archivo' : 'archivos'}
                            </span>
                        )}
                    </div>
                    
                    {todasLasEvidencias && todasLasEvidencias.length > 0 ? (
                        <div className="bg-white rounded-lg p-4 shadow-sm">
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
                                        <div className="relative overflow-hidden rounded-xl border-2 border-purple-200 shadow-lg bg-gradient-to-br from-white to-purple-50">
                                            <Image
                                                width={400}
                                                lazyBoundary="200px"
                                                height={300}
                                                src={src}
                                                alt={`Evidencia ${index + 1}`}
                                                className="w-full h-64 object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                                            />
                                            
                                            {/* Botón de descarga mejorado */}
                                            <button
                                                onClick={() => handleDescargarEvidencia(src, index)}
                                                className="absolute top-3 right-3 bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-full shadow-xl text-white hover:from-purple-600 hover:to-purple-700 transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
                                                title="Descargar evidencia"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </button>
                                            
                                            {/* Badge mejorado */}
                                            <div className="absolute bottom-3 left-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Evidencia {index + 1}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {permisos.puedeEditar && (
                                    <div className="p-2">
                                        <div 
                                            className="p-2 flex items-center justify-center border-2 border-dashed border-purple-300 rounded-xl shadow-md h-64 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 group cursor-pointer"
                                            onDragOver={handleDragOver}
                                            onDragEnter={handleDragEnter}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                        >
                                            <label className="flex flex-col items-center space-y-3 cursor-pointer">
                                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-90 duration-300">
                                                    <AiOutlinePlus className="text-white w-10 h-10" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-purple-600 text-base font-bold">Agregar Evidencia</p>
                                                    <p className="text-purple-400 text-xs mt-1">Arrastra o haz clic</p>
                                                </div>
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
                                )}
                            </Carousel>
                        </div>
                    ) : (
                        <div 
                            className="bg-white rounded-lg p-10 text-center border-2 border-dashed border-purple-200 shadow-sm"
                            onDragOver={permisos.puedeEditar ? handleDragOver : undefined}
                            onDragEnter={permisos.puedeEditar ? handleDragEnter : undefined}
                            onDragLeave={permisos.puedeEditar ? handleDragLeave : undefined}
                            onDrop={permisos.puedeEditar ? handleDrop : undefined}
                        >
                            <div className="flex flex-col items-center space-y-3">
                                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-600 font-semibold text-base">No hay evidencias disponibles</p>
                                    <p className="text-gray-400 text-sm mt-1">Las fotos del incidente aparecerán aquí</p>
                                </div>
                                {permisos.puedeEditar && (
                                    <div className="mt-4">
                                        <label className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                                            <AiOutlinePlus className="w-5 h-5" />
                                            Subir Evidencias
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleAddImage}
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Divider className="my-6" />
            
            {/* Tarjeta: Actualización de Estado */}
            {permisos.puedeEditar ? (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg shadow-sm">
                    <div className="p-5">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Actualizar Incidente</h3>
                                <p className="text-xs text-gray-600">Cambiar estado y agregar información</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* Botón para agregar involucrados */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span className="text-sm font-semibold text-gray-700">Gestionar Involucrados</span>
                                        </div>
                                        <p className="text-xs text-gray-500">Agregar responsables, testigos o afectados adicionales</p>
                                        {detalles?.idEstadoIncidente !== ESTADOS_INCIDENTE.EN_INVESTIGACION && (
                                            <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Requiere estado: En Investigación
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        startContent={<FiUserPlus className="w-4 h-4" />}
                                        onPress={onOpen}
                                        isDisabled={detalles?.idEstadoIncidente !== ESTADOS_INCIDENTE.EN_INVESTIGACION}
                                        className="font-semibold"
                                    >
                                        Agregar Involucrado
                                    </Button>
                                </div>
                            </div>

                            {/* Estado actual con badge */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Estado actual</span>
                                    </div>
                                    <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full">
                                        {obtenerTextoEstado(datosAMostrar?.idEstadoIncidente)}
                                    </span>
                                </div>
                            </div>

                            {/* Selector de nuevo estado */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                    Cambiar estado a
                                </label>
                                <Select
                                    placeholder="Seleccione el nuevo estado..."
                                    variant="bordered"
                                    color="success"
                                    selectedKeys={estadoSeleccionado ? [estadoSeleccionado.toString()] : []}
                                    onChange={(e) => setEstadoSeleccionado(Number(e.target.value))}
                                    className="w-full"
                                    classNames={{
                                        trigger: "border-gray-300 hover:border-green-400"
                                    }}
                                >
                                    {obtenerEstadosSiguientes(datosAMostrar?.idEstadoIncidente).map((estadoId) => (
                                        <SelectItem key={estadoId} value={estadoId}>
                                            {obtenerTextoEstado(estadoId)}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>

                            {/* Selector de Sanción - Obligatorio para EN_INVESTIGACION y RESUELTO */}
                            {/* CERRADO NO requiere sanción */}
                            {[ESTADOS_INCIDENTE.EN_INVESTIGACION, ESTADOS_INCIDENTE.RESUELTO].includes(estadoSeleccionado) && (
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-yellow-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.99-1.333-2.664 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Sanción/Gravedad
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    {loadingSanciones ? (
                                        <div className="flex justify-center py-6">
                                            <Spinner size="sm" color="warning" />
                                        </div>
                                    ) : (
                                        <Select
                                            placeholder="Seleccione la gravedad de la sanción..."
                                            variant="bordered"
                                            color="warning"
                                            selectedKeys={sancionSeleccionada ? [sancionSeleccionada.toString()] : []}
                                            onChange={(e) => setSancionSeleccionada(Number(e.target.value))}
                                            isRequired
                                            description={sancionSeleccionada && sanciones.find(s => s.idSancion === sancionSeleccionada)?.detalle}
                                            classNames={{
                                                trigger: "border-yellow-300 hover:border-yellow-400",
                                                description: "text-xs text-gray-600 mt-2"
                                            }}
                                        >
                                            {sanciones.map((sancion) => (
                                                <SelectItem key={sancion.idSancion} value={sancion.idSancion}>
                                                    {sancion.gravedad}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    )}
                                </div>
                            )}

                            {/* Campo de Observaciones */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Observaciones
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none"
                                    rows="4"
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    placeholder="Agregue observaciones sobre el cambio de estado..."
                                />
                            </div>

                            {/* Campo de Solución - Solo para estado RESUELTO */}
                            {estadoSeleccionado === ESTADOS_INCIDENTE.RESUELTO && (
                                <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-300">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Solución Planteada
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <textarea
                                        className="w-full border border-green-300 rounded-lg p-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none bg-white"
                                        rows="4"
                                        value={solucion}
                                        onChange={(e) => setSolucion(e.target.value)}
                                        placeholder="Describa la solución implementada para resolver el incidente..."
                                    />
                                    <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Este campo es obligatorio para marcar el incidente como resuelto
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-blue-800 mb-1">Información</p>
                            <p className="text-sm text-blue-700">{permisos.mensaje}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para agregar involucrado */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 pb-3">
                                <div className="flex items-center gap-2">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    <span>Agregar Involucrado al Incidente</span>
                                </div>
                                <p className="text-xs font-normal text-gray-500 mt-1 ml-8">
                                    Identifica estudiantes involucrados: responsables, testigos o afectados
                                </p>
                            </ModalHeader>
                            <ModalBody className="pt-5 pb-4 px-6">
                                <div className="space-y-7">
                                    <Input
                                        label="Cédula del Estudiante"
                                        labelPlacement="outside"
                                        placeholder="Ej: 123456789"
                                        variant="bordered"
                                        value={cedulaInvolucrado}
                                        onChange={(e) => setCedulaInvolucrado(e.target.value)}
                                        isRequired
                                        description="Ingrese la cédula completa del estudiante"
                                        classNames={{
                                            label: "text-gray-700 mb-2",
                                            input: "text-sm",
                                            description: "text-xs mt-1.5"
                                        }}
                                    />
                                    
                                    <Select
                                        label="Tipo de Involucramiento"
                                        labelPlacement="outside"
                                        placeholder="Seleccione el tipo"
                                        variant="bordered"
                                        selectedKeys={tipoInvolucrado ? [tipoInvolucrado] : []}
                                        onChange={(e) => setTipoInvolucrado(e.target.value)}
                                        isRequired
                                        classNames={{
                                            label: "text-gray-700 mb-2",
                                            trigger: "text-sm"
                                        }}
                                    >
                                        <SelectItem key="2" value="2">
                                            Responsable (Causó el daño)
                                        </SelectItem>
                                        <SelectItem key="3" value="3">
                                            Testigo (Presenció el incidente)
                                        </SelectItem>
                                        <SelectItem key="4" value="4">
                                            Afectado (Víctima del incidente)
                                        </SelectItem>
                                    </Select>

                                    <Input
                                        label="Sección"
                                        labelPlacement="outside"
                                        placeholder="Ej: 12-1"
                                        variant="bordered"
                                        value={seccionInvolucrado}
                                        onChange={(e) => setSeccionInvolucrado(e.target.value)}
                                        isRequired
                                        description="Sección del estudiante"
                                        classNames={{
                                            label: "text-gray-700 mb-2 mt-1",
                                            input: "text-sm",
                                            description: "text-xs mt-1.5"
                                        }}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter className="pt-5 pb-5">
                                <Button 
                                    color="danger" 
                                    variant="light" 
                                    onPress={onClose}
                                    isDisabled={agregandoInvolucrado}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    color="primary" 
                                    onPress={handleAgregarInvolucrado}
                                    isLoading={agregandoInvolucrado}
                                >
                                    Agregar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
});

FormularioRevision.displayName = 'FormularioRevision';

export default FormularioRevision;