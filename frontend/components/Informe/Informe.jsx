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
        setIsLoading(false); // Resetear loading al abrir
        onOpen();
    };

    // Función para manejar cambios en inputs
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Limpiar error cuando el usuario escriba
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    // Función de validación
    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (drawerContent === "casillero") {
            if (!formData.idCasillero.trim()) {
                newErrors.idCasillero = "El ID del casillero es requerido";
                isValid = false;
            }
            if (!formData.especialidad) {
                newErrors.especialidad = "La especialidad es requerida";
                isValid = false;
            }
        } else if (drawerContent === "estudiante") {
            if (!formData.cedulaEstudiante.trim()) {
                newErrors.cedulaEstudiante = "La cédula del estudiante es requerida";
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
                // Llamada para historial de estudiante
                data = await informeService.obtenerHistorialEstudiante(formData.cedulaEstudiante);
                
                // Generar PDF
                pdfGenerator.generarPDFHistorialEstudiante(data, formData.cedulaEstudiante);
                pdfName = `historial_estudiante_${formData.cedulaEstudiante}.pdf`;
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
            Toast.warning(
                "Error",
                error.message || "Hubo un problema al generar el informe"
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
            Toast.warning(
                "Error",
                error.message || "Hubo un problema al generar las estadísticas"
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
                            <Input
                                label="ID Casillero"
                                placeholder="1"
                                variant={"bordered"}
                                className="focus:border-primario"
                                color="primary"
                                value={formData.idCasillero}
                                onValueChange={(value) => handleInputChange("idCasillero", value)}
                                isRequired
                                isInvalid={!!errors.idCasillero}
                                errorMessage={errors.idCasillero}
                                isDisabled={isLoading}
                            />
                            <Select
                                label="Especialidad"
                                placeholder="Seleccione una especialidad"
                                variant={"bordered"}
                                className="focus:border-primario"
                                color="primary"
                                isLoading={loading}
                                selectedKeys={formData.especialidad ? [formData.especialidad] : []}
                                onSelectionChange={(keys) => {
                                    const selectedKey = Array.from(keys)[0];
                                    handleInputChange("especialidad", selectedKey);
                                }}
                                isRequired
                                isInvalid={!!errors.especialidad}
                                errorMessage={errors.especialidad}
                                isDisabled={isLoading}
                            >
                                {especialidades.map((especialidad) => (
                                    <SelectItem key={especialidad.id} value={especialidad.id}>
                                        {especialidad.nombre}
                                    </SelectItem>
                                ))}
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