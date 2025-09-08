import React, { useRef, useState, useEffect } from "react";
import { Select, Button, SelectItem, Spinner } from "@heroui/react";
import { useSession } from "next-auth/react";
import { PlusIcon } from "../icons/PlusIcon";
import { useIncidentes } from "../../hooks/useIncidentes";
import { obtenerArmariosPorEspecialidad, obtenerCasillerosPorEspecialidad } from "../../services/armarioService";

const FormularioCreacion = ({ onSuccess, onClose }) => {
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
                console.log("No se encontró la especialidad del usuario");
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
            console.log("Archivo seleccionado:", file.name);
            // Aquí puedes manejar la subida del archivo
            setFormData(prev => ({
                ...prev,
                evidencias: [...prev.evidencias, file]
            }));
        }
    };

    const handleSubmit = async () => {
        // Limpiar errores previos
        limpiarError();

        // Validaciones
        if (!formData.idCasillero) {
            alert("Por favor selecciona un casillero");
            return;
        }

        if (!formData.detalle.trim()) {
            alert("Por favor describe el incidente");
            return;
        }

        try {
            const incidenteData = {
                idCasillero: parseInt(formData.idCasillero),
                detalle: formData.detalle.trim(),
                cedulaUsuario: session.user.id, // Enviar la cédula del usuario logueado
                seccionReportante: session.user.seccion || "N/A"
            };

            const resultado = await crearIncidente(incidenteData);
            
            // Mostrar mensaje de éxito
            let mensaje = "¡Incidente reportado exitosamente!";
            
            if (resultado.incidente.esReportanteProfesor) {
                mensaje += "\n\nReportado como profesor.";
            } else if (resultado.incidente.esReportanteDueno) {
                mensaje += "\n\nHas reportado un incidente en tu propio casillero.";
            } else if (resultado.incidente.tieneDuenoConocido) {
                mensaje += "\n\nSe ha registrado al dueño del casillero como afectado.";
            } else {
                mensaje += "\n\nEl casillero reportado no tiene dueño asignado actualmente.";
            }
            
            alert(mensaje);
            
            // Limpiar formulario
            setFormData({
                idCasillero: "",
                detalle: "",
                evidencias: []
            });
            setArmarioSeleccionado("");
            
            // Llamar callbacks
            onSuccess?.(resultado);
            onClose?.();
            
        } catch (error) {
            console.error("Error al crear incidente:", error);
            alert(`Error al reportar el incidente: ${error.message}`);
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
                    Comparta la evidencia (Opcional):
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <div
                        className="border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center h-32 cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => handleFileSelect(fileInputRef1)}
                    >
                        <PlusIcon className="text-blue-400 w-10 h-10" />
                        <input
                            type="file"
                            ref={fileInputRef1}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div
                        className="border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center h-32 cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => handleFileSelect(fileInputRef2)}
                    >
                        <PlusIcon className="text-blue-400 w-10 h-10" />
                        <input
                            type="file"
                            ref={fileInputRef2}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button 
                    variant="light" 
                    onPress={onClose}
                    isDisabled={loading}
                >
                    Cancelar
                </Button>
                <Button 
                    color="primary" 
                    onPress={handleSubmit}
                    isLoading={loading}
                    isDisabled={!formData.idCasillero || !formData.detalle.trim()}
                >
                    {loading ? <Spinner size="sm" /> : "Reportar Incidente"}
                </Button>
            </div>
        </div>
    );
};

export default FormularioCreacion;