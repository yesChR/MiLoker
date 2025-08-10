import React, { useState } from "react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import { useDisclosure } from "@heroui/react";
import { Button, Input, Divider } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { Select, SelectItem } from "@heroui/react";
import { useEspecialidades } from "../../hooks/useEspecialidades";
import { Toast } from "../CustomAlert";
import { informeService } from "../../services/informeService";
import { pdfGenerator } from "../../utils/pdfGenerator";

const Informe = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [drawerContent, setDrawerContent] = useState(null);
    const { especialidades, loading } = useEspecialidades();
    
    // Estados para los formularios
    const [formData, setFormData] = useState({
        idCasillero: "",
        especialidad: "",
        cedulaEstudiante: ""
    });
    
    // Estados para errores
    const [errors, setErrors] = useState({
        idCasillero: "",
        especialidad: "",
        cedulaEstudiante: ""
    });
    
    // Estado para loading
    const [isLoading, setIsLoading] = useState(false);
    
    // Estado para casilleros por especialidad
    const [casillerosPorEspecialidad, setCasillerosPorEspecialidad] = useState([]);
    const [loadingCasilleros, setLoadingCasilleros] = useState(false);

    const handleOpenDrawer = (contentType) => {
        setDrawerContent(contentType);
        // Limpiar datos y errores al abrir
        setFormData({
            idCasillero: "",
            especialidad: "",
            cedulaEstudiante: ""
        });
        setErrors({
            idCasillero: "",
            especialidad: "",
            cedulaEstudiante: ""
        });
        setCasillerosPorEspecialidad([]);
        setIsLoading(false); // Resetear loading al abrir
        onOpen();
    };

    // Función para manejar cambios en inputs
    const handleInputChange = (field, value) => {
        // Si cambia la especialidad, cargar casilleros y limpiar casillero seleccionado
        if (field === "especialidad") {
            setFormData(prev => ({
                ...prev,
                [field]: value,
                idCasillero: "" // Limpiar casillero seleccionado
            }));
            
            // Limpiar error cuando el usuario seleccione
            if (errors[field]) {
                setErrors(prev => ({
                    ...prev,
                    [field]: "",
                    idCasillero: "" // También limpiar error de casillero
                }));
            }
            
            if (value) {
                cargarCasillerosPorEspecialidad(value);
            }
            return;
        }
        
        // Para otros campos
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Limpiar error cuando el usuario seleccione/escriba
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    // Función para cargar casilleros por especialidad
    const cargarCasillerosPorEspecialidad = async (idEspecialidad) => {
        if (!idEspecialidad) {
            setCasillerosPorEspecialidad([]);
            return;
        }

        setLoadingCasilleros(true);
        try {
            const data = await informeService.obtenerCasillerosPorEspecialidad(idEspecialidad);
            const casilleros = data.data.casilleros || [];
            
            // Ordenar casilleros por armario y luego por número
            const casillerosOrdenados = casilleros.sort((a, b) => {
                // Primero ordenar por armario
                if (a.armario !== b.armario) {
                    return (a.armario || 0) - (b.armario || 0);
                }
                // Luego ordenar por número de casillero
                return (a.numero || 0) - (b.numero || 0);
            });
            
            setCasillerosPorEspecialidad(casillerosOrdenados);
        } catch (error) {
            console.error("Error al cargar casilleros:", error);
            setCasillerosPorEspecialidad([]);
            Toast.warning(
                "Advertencia",
                "No se pudieron cargar los casilleros de la especialidad seleccionada"
            );
        } finally {
            setLoadingCasilleros(false);
        }
    };

    // Función de validación
    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (drawerContent === "casillero") {
            if (!formData.especialidad) {
                newErrors.especialidad = "La especialidad es requerida";
                isValid = false;
            }
            if (!formData.idCasillero) {
                if (casillerosPorEspecialidad.length === 0 && formData.especialidad) {
                    newErrors.idCasillero = "No hay casilleros disponibles para esta especialidad";
                } else {
                    newErrors.idCasillero = "El casillero es requerido";
                }
                isValid = false;
            }
        } else if (drawerContent === "estudiante") {
            const cedula = formData.cedulaEstudiante.trim();
            
            if (!cedula) {
                newErrors.cedulaEstudiante = "La cédula del estudiante es requerida";
                isValid = false;
            } else if (!/^\d{6,10}$/.test(cedula)) {
                newErrors.cedulaEstudiante = "La cédula debe contener entre 6 y 10 dígitos";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    // Función para manejar el submit
    const handleSubmit = async () => {
        if (!validateForm()) {
            // Solo mostrar errores en los campos, sin toast
            return;
        }

        setIsLoading(true); // Activar loading

        try {
            let data;
            let pdfName;

            if (drawerContent === "casillero") {
                // Llamada para historial de casillero
                data = await informeService.obtenerHistorialCasillero(
                    formData.idCasillero, 
                    formData.especialidad
                );
                
                // Generar PDF
                pdfGenerator.generarPDFHistorialCasillero(data, formData.idCasillero);
                pdfName = `historial_casillero_${formData.idCasillero}.pdf`;
                
            } else if (drawerContent === "estudiante") {
                // Llamada para historial de estudiante con manejo específico
                try {
                    data = await informeService.obtenerHistorialEstudiante(formData.cedulaEstudiante);
                    
                    // Solo generar PDF si la llamada fue exitosa
                    pdfGenerator.generarPDFHistorialEstudiante(data, formData.cedulaEstudiante);
                    pdfName = `historial_estudiante_${formData.cedulaEstudiante}.pdf`;
                } catch (estudianteError) {
                    // Manejo específico para errores de estudiante
                    setIsLoading(false);
                    
                    let errorMessage = "No se encontró ningún estudiante con la cédula especificada. Verifique que la cédula sea correcta y que el estudiante esté registrado en el sistema.";
                    let errorTitle = "Estudiante no encontrado";
                    
                    if (estudianteError.message) {
                        if (estudianteError.message.includes("No se encontró ningún estudiante")) {
                            errorMessage = "No se encontró ningún estudiante con la cédula especificada. Verifique que la cédula sea correcta y que el estudiante esté registrado en el sistema.";
                        } else {
                            errorMessage = estudianteError.message;
                        }
                    }
                    
                    Toast.warning(errorTitle, errorMessage);
                    return; // Salir de la función sin continuar
                }
            }
            
            console.log("Datos recibidos del backend:", data);
            
            Toast.success(
                "¡Éxito!",
                `Informe generado exitosamente. Se ha descargado el archivo: ${pdfName}`
            );
            
            setTimeout(() => {
                setIsLoading(false);
                onOpenChange(false);
            }, 1000);
            
        } catch (error) {
            setIsLoading(false);
            console.error("Error al generar informe:", error);
            
            // Este catch solo maneja errores de casilleros ya que los de estudiante se manejan arriba
            let errorMessage = "Hubo un problema al generar el informe";
            let errorTitle = "Error";
            
            if (error.message) {
                errorMessage = error.message;
                
                // Detectar tipos específicos de errores para casilleros
                if (error.message.includes("No se encontró")) {
                    errorTitle = "Datos no encontrados";
                    errorMessage = "No se encontraron datos para el casillero especificado.";
                } else if (error.message.includes("Error 404")) {
                    errorTitle = "Datos no encontrados";
                    errorMessage = "Los datos solicitados no se encontraron en el sistema.";
                } else if (error.message.includes("Error 500")) {
                    errorTitle = "Error del servidor";
                    errorMessage = "Ocurrió un error interno en el servidor. Por favor, intente nuevamente más tarde.";
                }
            }
            
            Toast.warning(
                errorTitle,
                errorMessage
            );
        }
    };

    // Función para generar informe estadístico general
    const handleGenerarEstadisticas = async () => {
        try {
            const data = await informeService.obtenerEstadisticasGenerales();
            
            // Generar PDF
            pdfGenerator.generarPDFEstadisticasGenerales(data);
            
            console.log("Estadísticas obtenidas:", data);
            
            Toast.success(
                "¡Éxito!",
                "Informe estadístico generado exitosamente. Se ha descargado el archivo: estadisticas_casilleros.pdf"
            );
            
        } catch (error) {
            console.error("Error al generar estadísticas:", error);
            
            let errorMessage = "Hubo un problema al generar las estadísticas";
            let errorTitle = "Error";
            
            if (error.message) {
                errorMessage = error.message;
                
                if (error.message.includes("Error 500")) {
                    errorTitle = "Error del servidor";
                    errorMessage = "Ocurrió un error interno en el servidor. Por favor, intente nuevamente más tarde.";
                } else if (error.message.includes("No se encontraron")) {
                    errorTitle = "Sin datos";
                    errorMessage = "No se encontraron datos para generar las estadísticas.";
                }
            }
            
            Toast.warning(
                errorTitle,
                errorMessage
            );
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-10 px-4">
            <div className="w-full">
                <CabezeraDinamica
                    title="Informes"
                    breadcrumb="Inicio • Informes"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto w-full max-w-4xl">
                {/* Card 1 */}
                <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300">
                    <div>
                        <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
                                <span className="text-white text-lg">📊</span>
                            </div>
                            <h2 className="text-xl font-semibold text-azulOscuro">Informe general detallado</h2>
                        </div>
                        <Divider className="my-4 bg-cabecera h-[2px]" />
                        <p className="text-gray-600 text-justify leading-relaxed">
                            Esta opción permite generar un informe detallado y de forma gráfica la información sobre el total de casilleros donde se reflejarán aquellos qué estén <span className="font-semibold text-blue-600">disponibles, asignados o dañados</span>. Ideal para obtener una visión general rápida y organizada.
                        </p>
                    </div>
                    <div className="mt-6">
                        <Button 
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-md font-semibold shadow-lg rounded-xl transition-all duration-300 transform hover:scale-105"
                            onPress={handleGenerarEstadisticas}
                        >
                            📈 Generar informe
                        </Button>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300">
                    <div>
                        <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
                                <span className="text-white text-lg">🗂️</span>
                            </div>
                            <h2 className="text-xl font-semibold text-azulOscuro">Historial por casillero</h2>
                        </div>
                        <Divider className="my-4 bg-cabecera h-[2px]" />
                        <p className="text-gray-600 text-justify leading-relaxed">
                            Aquí se podrá consultar el historial completo de cada casillero específico, incluyendo <span className="font-semibold text-green-600">registros de uso, fechas de asignación, así como incidentes</span> asociados. Útil para hacer un seguimiento detallado del uso que ha tenido cada casillero a lo largo del tiempo.
                        </p>
                    </div>
                    <div className="mt-6">
                        <Button
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-md font-semibold shadow-lg rounded-xl transition-all duration-300 transform hover:scale-105"
                            onPress={() => handleOpenDrawer("casillero")}
                        >
                            🗃️ Generar informe
                        </Button>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300">
                    <div>
                        <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
                                <span className="text-white text-lg">👨‍🎓</span>
                            </div>
                            <h2 className="text-xl font-semibold text-azulOscuro">Historial por estudiante</h2>
                        </div>
                        <Divider className="my-4 bg-cabecera h-[2px]" />
                        <p className="text-gray-600 text-justify leading-relaxed">
                            Permite acceder a un informe completo del historial de uso de casilleros de un estudiante específico. Incluye información sobre <span className="font-semibold text-purple-600">detalles específicos del comportamiento</span> de cada usuario respecto al préstamo de casilleros.
                        </p>
                    </div>
                    <div className="mt-6">
                        <Button
                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-md font-semibold shadow-lg rounded-xl transition-all duration-300 transform hover:scale-105"
                            onPress={() => handleOpenDrawer("estudiante")}
                        >
                            📋 Generar informe
                        </Button>
                    </div>
                </div>

                {/* Drawer */}
                <DrawerGeneral
                    titulo={
                        drawerContent === "casillero"
                            ? "Historial por Casillero"
                            : drawerContent === "estudiante"
                                ? "Historial por Estudiante"
                                : ""
                    }
                    size={"sm"}
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    textoBotonPrimario="Generar"
                    onBotonPrimario={handleSubmit}
                    textoBotonSecundario="Cancelar"
                    onBotonSecundario={() => onOpenChange(false)}
                    loadingBotonPrimario={isLoading}
                    disableClose={isLoading}
                >
                    {drawerContent === "casillero" && (
                        <>
                            <Select
                                label="Especialidad"
                                placeholder="Seleccione una especialidad"
                                variant={"bordered"}
                                className="focus:border-primario"
                                color="primary"
                                isLoading={loading}
                                selectionMode="single"
                                selectedKeys={formData.especialidad ? new Set([String(formData.especialidad)]) : new Set()}
                                onSelectionChange={(keys) => {
                                    const selectedKey = keys.size > 0 ? Array.from(keys)[0] : "";
                                    handleInputChange("especialidad", selectedKey);
                                }}
                                renderValue={(items) => {
                                    if (!items || items.length === 0) return null;
                                    const selectedEspecialidad = especialidades.find(
                                        esp => String(esp.idEspecialidad) === String(items[0].key)
                                    );
                                    return selectedEspecialidad ? selectedEspecialidad.nombre : null;
                                }}
                                isRequired
                                isInvalid={!!errors.especialidad}
                                errorMessage={errors.especialidad}
                                isDisabled={isLoading}
                            >
                                {especialidades.map((especialidad) => (
                                    <SelectItem key={String(especialidad.idEspecialidad)} value={String(especialidad.idEspecialidad)}>
                                        {especialidad.nombre}
                                    </SelectItem>
                                ))}
                            </Select>
                            
                            <Select
                                label="Casillero"
                                placeholder={
                                    !formData.especialidad 
                                        ? "Primero seleccione una especialidad"
                                        : casillerosPorEspecialidad.length === 0 && !loadingCasilleros
                                            ? "No hay casilleros disponibles"
                                            : "Seleccione un casillero"
                                }
                                variant={"bordered"}
                                className="focus:border-primario"
                                color="primary"
                                isLoading={loadingCasilleros}
                                selectionMode="single"
                                selectedKeys={formData.idCasillero ? new Set([String(formData.idCasillero)]) : new Set()}
                                onSelectionChange={(keys) => {
                                    const selectedKey = keys.size > 0 ? Array.from(keys)[0] : "";
                                    handleInputChange("idCasillero", selectedKey);
                                }}
                                renderValue={(items) => {
                                    if (!items || items.length === 0) return null;
                                    const selectedCasillero = casillerosPorEspecialidad.find(
                                        cas => String(cas.id) === String(items[0].key)
                                    );
                                    return selectedCasillero ? `${selectedCasillero.numeroSecuencia} - ${selectedCasillero.detalle}` : null;
                                }}
                                isRequired
                                isInvalid={!!errors.idCasillero}
                                errorMessage={errors.idCasillero}
                                isDisabled={isLoading || !formData.especialidad || loadingCasilleros || casillerosPorEspecialidad.length === 0}
                            >
                                {casillerosPorEspecialidad.length > 0 ? (
                                    casillerosPorEspecialidad.map((casillero) => (
                                        <SelectItem key={String(casillero.id)} value={String(casillero.id)}>
                                            {casillero.numeroSecuencia} - {casillero.detalle}
                                        </SelectItem>
                                    ))
                                ) : (
                                    formData.especialidad && !loadingCasilleros && (
                                        <SelectItem key="no-casilleros" value="" isDisabled>
                                            No hay casilleros disponibles para esta especialidad
                                        </SelectItem>
                                    )
                                )}
                            </Select>
                        </>
                    )}
                    {drawerContent === "estudiante" && (
                        <>
                            <Input
                                label="Cédula del Estudiante"
                                placeholder="703110111"
                                variant={"bordered"}
                                className="focus:border-primario"
                                color="primary"
                                value={formData.cedulaEstudiante}
                                onValueChange={(value) => handleInputChange("cedulaEstudiante", value)}
                                isRequired
                                isInvalid={!!errors.cedulaEstudiante}
                                errorMessage={errors.cedulaEstudiante}
                                isDisabled={isLoading}
                            />
                        </>
                    )}
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default Informe;