import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Select, Button, SelectItem, Spinner } from "@heroui/react";
import { useSession } from "next-auth/react";
import { PlusIcon } from "../icons/PlusIcon";
import { useIncidentes } from "../../hooks/useIncidentes";
import { obtenerArmariosPorEspecialidad, obtenerCasillerosPorEspecialidad } from "../../services/armarioService";
import { Toast } from "../CustomAlert";
import { subirEvidencias } from "../../services/evidenciaService";
import { uploadService } from "../../services/uploadService";

const FormularioCreacion = forwardRef(({ onSuccess, onClose }, ref) => {
    const { data: session, status } = useSession();
    const { crearIncidente, loading, error, limpiarError } = useIncidentes();
    
    const [formData, setFormData] = useState({
        idCasillero: "",
        detalle: "",
        evidencias: []
    });
    
    const [armarios, setArmarios] = useState([]);
    const [casilleros, setCasilleros] = useState([]);
    const [armarioSeleccionado, setArmarioSeleccionado] = useState("");
    const [loadingArmarios, setLoadingArmarios] = useState(false);
    const [loadingCasilleros, setLoadingCasilleros] = useState(false);

    const fileInputRef1 = useRef(null);
    const fileInputRef2 = useRef(null);

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
                    setCasilleros(resultadoCasilleros.data?.casilleros || []);
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

    // Exponer handleSubmit al componente padre
    useImperativeHandle(ref, () => ({
        handleSubmit: handleSubmit
    }));

    // Filtrar casilleros por armario seleccionado
    const casillerosFiltrados = armarioSeleccionado 
        ? casilleros.filter(casillero => casillero.armario === armarioSeleccionado)
        : casilleros;

    const handleFileSelect = (ref) => {
        if (ref.current) {
            ref.current.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validar tamaño del archivo (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                Toast.warning("Archivo muy grande", "El archivo no puede exceder 5MB");
                return;
            }

            // Validar tipo de archivo
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                Toast.warning("Tipo de archivo no válido", "Solo se permiten imágenes (JPEG, PNG, WebP)");
                return;
            }

            // Determinar qué posición usar
            const newEvidencias = [...formData.evidencias];
            
            // Si no hay evidencias, agregar en posición 0
            if (newEvidencias.length === 0) {
                newEvidencias[0] = file;
            }
            // Si hay una evidencia, agregar en posición 1
            else if (newEvidencias.length === 1) {
                newEvidencias[1] = file;
            }
            // Si ya hay 2, no hacer nada (esto no debería pasar por la UI)
            else {
                Toast.warning("Límite alcanzado", "Solo puedes subir máximo 2 evidencias");
                return;
            }

            setFormData(prev => ({
                ...prev,
                evidencias: newEvidencias
            }));

            Toast.success("Evidencia agregada", `${file.name} se agregó correctamente`);
        }
    };

    const removeEvidence = (index) => {
        // Liberar la URL del objeto antes de remover para evitar memory leaks
        if (formData.evidencias[index]) {
            URL.revokeObjectURL(URL.createObjectURL(formData.evidencias[index]));
        }
        
        const newEvidencias = [...formData.evidencias];
        newEvidencias.splice(index, 1); // Remover el elemento en la posición específica
        
        setFormData(prev => ({
            ...prev,
            evidencias: newEvidencias
        }));
        
        Toast.info("Evidencia removida", "La evidencia se eliminó correctamente");
    };

    const handleSubmit = async () => {
        // Limpiar errores previos
        limpiarError();

        // Validaciones
        if (!formData.idCasillero) {
            Toast.warning("Validación", "Por favor selecciona un casillero");
            return;
        }

        if (!formData.detalle.trim()) {
            Toast.warning("Validación", "Por favor describe el incidente");
            return;
        }

        try {
            let evidenciasIds = [];
            
            // Subir evidencias primero si existen
            if (formData.evidencias.length > 0) {
                Toast.info("Subiendo evidencias", "Por favor espera...");
                
                const resultadoEvidencias = await subirEvidencias(formData.evidencias);
                
                if (resultadoEvidencias.error) {
                    Toast.error("Error subiendo evidencias", resultadoEvidencias.message);
                    return;
                }
                
                evidenciasIds = resultadoEvidencias.evidencias.map(ev => ev.idEvidencia);
                Toast.success("Evidencias subidas", "Las evidencias se subieron correctamente");
            }

            const incidenteData = {
                idCasillero: parseInt(formData.idCasillero),
                detalle: formData.detalle.trim(),
                cedulaUsuario: session.user.id,
                evidenciasIds: evidenciasIds,
                seccionReportante: session.user.seccion || "N/A"
            };

            const resultado = await crearIncidente(incidenteData);
            
            // Mostrar mensaje de éxito con Toast
            let mensaje = "Incidente reportado exitosamente";
            let detalle = "";
            
            if (resultado.incidente.esReportanteProfesor) {
                detalle = "Reportado como profesor.";
            } else if (resultado.incidente.esReportanteDueno) {
                detalle = "Has reportado un incidente en tu propio casillero.";
            } else if (resultado.incidente.tieneDuenoConocido) {
                detalle = "Se ha registrado al dueño del casillero como afectado.";
            } else {
                detalle = "El casillero reportado no tiene dueño asignado actualmente.";
            }
            
            Toast.success(mensaje, detalle);
            
            // Limpiar formulario
            setFormData({
                idCasillero: "",
                detalle: "",
                evidencias: []
            });
            setArmarioSeleccionado("");
            
            // Limpiar URLs de objetos para evitar memory leaks
            formData.evidencias.forEach(file => {
                if (file) URL.revokeObjectURL(URL.createObjectURL(file));
            });
            
            // Llamar callbacks
            onSuccess?.(resultado);
            onClose?.();
            
        } catch (error) {
            console.error("Error al crear incidente:", error);
            Toast.error("Error al reportar incidente", error.message || "Ocurrió un error inesperado");
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <Select
                    label="Armario"
                    placeholder="Seleccionar Armario"
                    variant="bordered"
                    isLoading={loadingArmarios}
                    selectedKeys={armarioSeleccionado ? [armarioSeleccionado] : []}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        setArmarioSeleccionado(selectedKey || "");
                        setFormData(prev => ({ ...prev, idCasillero: "" }));
                    }}
                >
                    {armarios.map((armario) => (
                        <SelectItem key={armario.idArmario} value={armario.idArmario}>
                            Armario {armario.idArmario}
                        </SelectItem>
                    ))}
                </Select>

                <Select
                    label="Casillero"
                    placeholder="Seleccionar Casillero"
                    variant="bordered"
                    isDisabled={!armarioSeleccionado}
                    isLoading={loadingCasilleros}
                    selectedKeys={formData.idCasillero ? [formData.idCasillero.toString()] : []}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        setFormData(prev => ({ ...prev, idCasillero: selectedKey || "" }));
                    }}
                >
                    {casillerosFiltrados.map((casillero) => (
                        <SelectItem key={casillero.id.toString()} value={casillero.id.toString()}>
                            {casillero.numeroSecuencia} {casillero.detalle !== 'Sin detalle' ? `- ${casillero.detalle}` : ''}
                        </SelectItem>
                    ))}
                </Select>
            </div>

            <div>
                <textarea
                    placeholder="Describa detalladamente el incidente encontrado..."
                    className="focus:outline-none focus:ring-2 focus:ring-primary border-2 rounded-xl p-3 w-full placeholder:text-sm text-gray-900 min-h-[100px] resize-y"
                    value={formData.detalle}
                    onChange={(e) => setFormData(prev => ({ ...prev, detalle: e.target.value }))}
                />
            </div>

            <div>
                <label className="text-gray-500 text-sm mb-2 block">
                    Evidencias (Opcional - Máximo 2):
                </label>

                <div className="grid grid-cols-2 gap-4">
                    {/* Espacio 1 - Evidencia o área de carga */}
                    <div>
                        {formData.evidencias[0] ? (
                            // Mostrar evidencia 1 con vista previa
                            <div className="relative border-2 border-blue-300 rounded-lg p-2">
                                <div className="space-y-2">
                                    {/* Vista previa de la imagen */}
                                    <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={URL.createObjectURL(formData.evidencias[0])}
                                            alt="Vista previa"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeEvidence(0)}
                                            className="absolute top-1 right-1 text-white bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
                                            title="Eliminar evidencia"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    {/* Información del archivo */}
                                    <div className="px-2">
                                        <span className="text-xs text-gray-700 block truncate">{formData.evidencias[0].name}</span>
                                        <span className="text-xs text-gray-500">({(formData.evidencias[0].size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Área de carga 1
                            <div
                                className="border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center h-32 cursor-pointer hover:bg-blue-50 transition-colors"
                                onClick={() => handleFileSelect(fileInputRef1)}
                            >
                                <div className="text-center">
                                    <PlusIcon className="mx-auto w-10 h-10 text-blue-400" />
                                    <p className="text-sm mt-2 text-blue-600">Agregar evidencia</p>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef1}
                                    className="hidden"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    onChange={handleFileChange}
                                />
                            </div>
                        )}
                    </div>

                    {/* Espacio 2 - Evidencia o área de carga */}
                    <div>
                        {formData.evidencias[1] ? (
                            // Mostrar evidencia 2 con vista previa
                            <div className="relative border-2 border-blue-300 rounded-lg p-2">
                                <div className="space-y-2">
                                    {/* Vista previa de la imagen */}
                                    <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={URL.createObjectURL(formData.evidencias[1])}
                                            alt="Vista previa"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeEvidence(1)}
                                            className="absolute top-1 right-1 text-white bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
                                            title="Eliminar evidencia"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    {/* Información del archivo */}
                                    <div className="px-2">
                                        <span className="text-xs text-gray-700 block truncate">{formData.evidencias[1].name}</span>
                                        <span className="text-xs text-gray-500">({(formData.evidencias[1].size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Área de carga 2
                            <div
                                className="border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center h-32 cursor-pointer hover:bg-blue-50 transition-colors"
                                onClick={() => handleFileSelect(fileInputRef2)}
                            >
                                <div className="text-center">
                                    <PlusIcon className="mx-auto w-10 h-10 text-blue-400" />
                                    <p className="text-sm mt-2 text-blue-600">Agregar evidencia</p>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef2}
                                    className="hidden"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    onChange={handleFileChange}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FormularioCreacion;