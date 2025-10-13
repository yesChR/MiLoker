import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Image from "next/image";
import { Select, Button, SelectItem, Spinner } from "@heroui/react";
import { useSession } from "next-auth/react";
import { PlusIcon } from "../icons/PlusIcon";
import { useIncidentes } from "../../hooks/useIncidentes";
import { useSanciones } from "../../hooks/useSanciones";
import { obtenerArmariosPorEspecialidad, obtenerCasillerosPorEspecialidad } from "../../services/armarioService";
import { Toast } from "../CustomAlert";
import { subirEvidencias } from "../../services/evidenciaService";
import { validarArchivo, validarFormulario, obtenerDetalleIncidente } from "../../utils/formValidation";
import { ordenarCasillerosPorNumero, limpiarURLsArchivos } from "../../utils/dataUtils";
import { ROLES } from "../../utils/rolesConstants";

const FormularioCreacion = forwardRef(({ onSuccess, onClose, onSubmittingChange }, ref) => {
    const { data: session, status } = useSession();
    const { crearIncidente, loading, error, limpiarError } = useIncidentes();
    const { sanciones, loading: loadingSanciones } = useSanciones();

    const [submitting, setSubmitting] = useState(false); // Estado local para prevenir múltiples envíos
    const [formData, setFormData] = useState({
        idCasillero: "",
        detalle: "",
        evidencias: [],
        idSancion: null
    });

    const [armarios, setArmarios] = useState([]);
    const [casilleros, setCasilleros] = useState([]);
    const [armarioSeleccionado, setArmarioSeleccionado] = useState("");
    const [loadingArmarios, setLoadingArmarios] = useState(false);
    const [loadingCasilleros, setLoadingCasilleros] = useState(false);

    const fileInputRef = useRef(null);

    // Cargar armarios y casilleros por especialidad del usuario
    useEffect(() => {
        const cargarDatosPorEspecialidad = async () => {
            if (!session?.user?.idEspecialidad) {
                console.error("No se encontró la especialidad del usuario");
                return;
            }

            try {
                setLoadingArmarios(true);
                setLoadingCasilleros(true);

                // Cargar armarios por especialidad
                const resultadoArmarios = await obtenerArmariosPorEspecialidad(session.user.idEspecialidad);
                if (resultadoArmarios.error) {
                    console.error("Error cargando armarios:", resultadoArmarios.message);
                    setArmarios([]);
                } else {
                    setArmarios(resultadoArmarios);
                }

                // Cargar casilleros por especialidad
                const resultadoCasilleros = await obtenerCasillerosPorEspecialidad(session.user.idEspecialidad);
                if (resultadoCasilleros.error) {
                    console.error("Error cargando casilleros:", resultadoCasilleros.message);
                    setCasilleros([]);
                } else {
                    // Extraer los casilleros del formato de respuesta
                    const casillerosData = resultadoCasilleros.data?.casilleros || [];
                    setCasilleros(casillerosData);
                }
            } catch (error) {
                console.error("Error cargando datos:", error);
                setArmarios([]);
                setCasilleros([]);
            } finally {
                setLoadingArmarios(false);
                setLoadingCasilleros(false);
            }
        };

        if (session?.user?.idEspecialidad) {
            cargarDatosPorEspecialidad();
        }
    }, [session]);

    // Notificar al padre cuando cambie el estado de submitting
    useEffect(() => {
        if (onSubmittingChange) {
            onSubmittingChange(submitting);
        }
    }, [submitting, onSubmittingChange]);

    // Exponer handleSubmit al componente padre
    useImperativeHandle(ref, () => ({
        handleSubmit: () => handleSubmit(),
        isSubmitting: () => submitting
    }));

    // Verificar que el usuario esté autenticado
    if (status === "loading") {
        return (
            <div className="flex justify-center items-center h-32">
                <Spinner size="lg" />
            </div>
        );
    }

    if (status === "unauthenticated" || !session?.user) {
        return (
            <div className="text-center p-4">
                <p className="text-red-500">Debes estar autenticado para reportar incidentes</p>
            </div>
        );
    }

    // Filtrar casilleros por armario seleccionado
    const casillerosFiltrados = armarioSeleccionado
        ? casilleros.filter(casillero => casillero.armario === armarioSeleccionado)
        : [];

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!validarArchivo(file) || formData.evidencias.length >= 2) return;
        
        setFormData(prev => ({
            ...prev,
            evidencias: [...prev.evidencias, file]
        }));
    };

    const removeEvidence = (index) => {
        const newEvidencias = formData.evidencias.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            evidencias: newEvidencias
        }));
    };

    const handleSubmit = async () => {
        // Prevenir múltiples envíos
        if (submitting) {
            return;
        }

        limpiarError();

        const validacion = validarFormulario(formData);
        
        if (!validacion.valido) {
            Toast.warning("Validación", validacion.mensaje);
            return;
        }

        // Validar sanción para profesores
        if (session?.user?.role === ROLES.PROFESOR && formData.idSancion) {
            // Profesor puede opcionalmente agregar sanción
        }

        setSubmitting(true); // Bloquear botón

        try {
            let evidenciasIds = [];

            if (formData.evidencias.length > 0) {
                const resultadoEvidencias = await subirEvidencias(formData.evidencias);
                if (resultadoEvidencias.error) {
                    Toast.error("Error al reportar incidente", resultadoEvidencias.message);
                    setSubmitting(false);
                    return;
                }
                evidenciasIds = resultadoEvidencias.evidencias.map(ev => ev.idEvidencia);
            }

            const incidenteData = {
                idCasillero: parseInt(formData.idCasillero),
                detalle: formData.detalle.trim(),
                cedulaUsuario: session.user.id,
                evidenciasIds: evidenciasIds,
                seccionReportante: session.user.seccion || "N/A",
                idSancion: formData.idSancion || null
            };

            const resultado = await crearIncidente(incidenteData);

            // Mostrar mensaje de éxito con Toast
            let mensaje = "Incidente reportado exitosamente";
            let detalle = "";

            detalle = obtenerDetalleIncidente(resultado.incidente);

            Toast.success(mensaje, detalle);

            // Limpiar formulario
            setFormData({
                idCasillero: "",
                detalle: "",
                evidencias: [],
                idSancion: null
            });
            setArmarioSeleccionado("");

            // Limpiar URLs de objetos
            limpiarURLsArchivos(formData.evidencias);

            // Llamar callbacks
            onSuccess?.(resultado);
            onClose?.();

        } catch (error) {
            console.error("Error al crear incidente:", error);
            Toast.error("Error al reportar incidente", error.message || "Ocurrió un error inesperado");
        } finally {
            setSubmitting(false); // Desbloquear botón
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Select
                    aria-label="Selección de Armario"
                    label="Armario"
                    placeholder="Seleccionar Armario"
                    variant="bordered"
                    color="primary"
                    isRequired
                    isLoading={loadingArmarios}
                    selectedKeys={armarioSeleccionado ? new Set([String(armarioSeleccionado)]) : new Set([])}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        setArmarioSeleccionado(selectedKey);
                        setFormData(prev => ({ ...prev, idCasillero: "" }));
                    }}
                >
                    {armarios.map((armario) => (
                        <SelectItem
                            key={String(armario.idArmario)}
                            textValue={`Armario ${armario.idArmario}`}
                        >
                            Armario {armario.idArmario}
                        </SelectItem>
                    ))}
                </Select>

                <Select
                    aria-label="Selección de Casillero"
                    label="Casillero"
                    placeholder="Seleccionar Casillero"
                    variant="bordered"
                    color="primary"
                    isRequired
                    isDisabled={!armarioSeleccionado}
                    isLoading={loadingCasilleros}
                    selectedKeys={formData.idCasillero ? new Set([formData.idCasillero]) : new Set()}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        setFormData(prev => ({ ...prev, idCasillero: selectedKey || "" }));
                    }}
                >
                    {casillerosFiltrados.length > 0 ? (
                        ordenarCasillerosPorNumero(casillerosFiltrados).map((casillero) => (
                            <SelectItem
                                key={String(casillero.id)}
                                value={String(casillero.id)}
                                textValue={`Casillero ${casillero.numero}`}
                            >
                                Casillero {casillero.numero}
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem key="no-casilleros" isDisabled>
                            {armarioSeleccionado ? "No hay casilleros disponibles" : "Seleccione un armario primero"}
                        </SelectItem>
                    )}
                </Select>
            </div>

            {/* Selector de Sanción - Solo para PROFESORES */}
            {session?.user?.role === ROLES.PROFESOR && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Sanción/Gravedad (Opcional)
                    </label>
                    {loadingSanciones ? (
                        <div className="flex justify-center py-4">
                            <Spinner size="sm" />
                        </div>
                    ) : (
                        <Select
                            aria-label="Selección de Sanción"
                            placeholder="Seleccione la gravedad de la sanción..."
                            variant="bordered"
                            color="primary"
                            selectedKeys={formData.idSancion ? new Set([String(formData.idSancion)]) : new Set()}
                            onSelectionChange={(keys) => {
                                const selectedKey = Array.from(keys)[0];
                                setFormData(prev => ({ ...prev, idSancion: selectedKey ? Number(selectedKey) : null }));
                            }}
                            description={formData.idSancion ? sanciones.find(s => s.idSancion === formData.idSancion)?.detalle : "Si asigna una sanción, el incidente pasará directamente a investigación"}
                        >
                            {sanciones.map((sancion) => (
                                <SelectItem
                                    key={String(sancion.idSancion)}
                                    value={String(sancion.idSancion)}
                                    textValue={sancion.gravedad}
                                >
                                    {sancion.gravedad}
                                </SelectItem>
                            ))}
                        </Select>
                    )}
                </div>
            )}

            <div>
                <div className="flex items-center gap-2 mb-2">
                    <label className="text-gray-700 text-sm">Descripción del incidente<span className="text-red-500 ml-0.5">*</span></label>
                </div>
                <textarea
                    placeholder="Describa detalladamente el incidente encontrado..."
                    className="focus:outline-none focus:ring-2 focus:ring-primary border-2 rounded-xl p-3 w-full placeholder:text-sm text-gray-900 min-h-[100px] resize-y"
                    value={formData.detalle}
                    onChange={(e) => setFormData(prev => ({ ...prev, detalle: e.target.value }))}
                    aria-required="true"
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <label className="text-gray-700 text-sm">Evidencias</label>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        Opcional - Máximo 2
                    </span>
                </div>
                <div className={`grid ${formData.evidencias.length > 0 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                    {formData.evidencias.map((file, idx) => (
                        <div key={idx} className="relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden group">
                            <div>
                                <div className="relative w-full h-32">
                                    <Image
                                        src={URL.createObjectURL(file)}
                                        alt="Vista previa de evidencia"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeEvidence(idx)}
                                        className="absolute top-2 right-2 text-white bg-red-500/90 hover:bg-red-600 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Eliminar evidencia"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="p-3 bg-white border-t border-gray-100">
                                    <span className="text-sm text-gray-700 font-medium block truncate mb-0.5">{file.name}</span>
                                    <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {formData.evidencias.length < 2 && (
                        <div
                            className="bg-white border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center h-[160px] cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                            onClick={handleFileSelect}
                        >
                            <div className="text-center px-4">
                                <div className="mb-2 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-100 transition-colors">
                                    <PlusIcon className="w-6 h-6 text-blue-500" />
                                </div>
                                <p className="text-sm font-medium text-blue-600 group-hover:text-blue-700">Agregar evidencia</p>
                                <p className="text-xs text-gray-500 mt-1">Haz clic o arrastra una imagen aquí</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                onChange={handleFileChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

FormularioCreacion.displayName = 'FormularioCreacion';

export default FormularioCreacion;