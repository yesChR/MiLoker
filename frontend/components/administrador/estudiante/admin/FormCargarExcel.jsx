import React, { useState, useImperativeHandle, forwardRef, useCallback } from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { BiUpload, BiX, BiFile } from "react-icons/bi";

const FormCargarExcel = forwardRef(({ selectedItem, setSelectedItem, onSubmit }, ref) => {
    const [showErrors, setShowErrors] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    
    const validateAndSubmit = () => {
        // Activar la visualización de errores
        setShowErrors(true);
        
        if (files.length === 0) {
            // No enviar si no hay archivos
            return false;
        }
        
        // Llamar la función onSubmit si se proporciona y hay archivos
        if (onSubmit) {
            onSubmit(files);
            return true;
        }
        return false;
    };

    // Exponer la función de validación al componente padre
    useImperativeHandle(ref, () => ({
        validateAndSubmit
    }));

    // Manejar drag and drop
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const droppedFiles = Array.from(e.dataTransfer.files);
        const excelFiles = droppedFiles.filter(file => 
            file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.type === "application/vnd.ms-excel" ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls')
        );
        
        if (excelFiles.length > 0) {
            setFiles(prevFiles => [...prevFiles, ...excelFiles]);
            setShowErrors(false); // Resetear errores cuando se agregan archivos
        }
    }, []);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const excelFiles = selectedFiles.filter(file => 
            file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.type === "application/vnd.ms-excel" ||
            file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls')
        );
        
        if (excelFiles.length > 0) {
            setFiles(prevFiles => [...prevFiles, ...excelFiles]);
            setShowErrors(false); // Resetear errores cuando se agregan archivos
        }
    };

    const removeFile = (indexToRemove) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Información importante */}
            <Card>
                <CardBody className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        📋 Instrucciones para cargar estudiantes
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Los archivos deben estar en formato Excel (.xlsx o .xls)</li>
                        <li>• Puedes cargar uno o múltiples archivos a la vez</li>
                        <li>• Los datos deben empezar desde la fila 6 del archivo</li>
                        <li>• Se crearán usuarios automáticamente para estudiantes nuevos</li>
                        <li>• Si el estudiante ya existe, solo se actualizará la sección</li>
                    </ul>
                </CardBody>
            </Card>

            {/* Zona de drag and drop */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                        ? 'border-primary bg-primary/10' 
                        : showErrors && files.length === 0
                            ? 'border-danger bg-danger/5'
                            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <BiUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                    Arrastra y suelta archivos Excel aquí
                </p>
                <p className="text-sm text-gray-500 mb-4">
                    o haz clic para seleccionar archivos
                </p>
                <input
                    type="file"
                    multiple
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                />
                <Button
                    as="label"
                    htmlFor="file-upload"
                    color="primary"
                    variant="bordered"
                    startContent={<BiFile />}
                    className="cursor-pointer"
                >
                    Seleccionar archivos
                </Button>
                
                {showErrors && files.length === 0 && (
                    <p className="text-sm text-danger mt-2">
                        Debes seleccionar al menos un archivo Excel
                    </p>
                )}
            </div>

            {/* Lista de archivos seleccionados */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">
                        Archivos seleccionados ({files.length})
                    </h4>
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                            >
                                <div className="flex items-center space-x-3">
                                    <BiFile className="text-green-500 text-xl" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Chip
                                        size="sm"
                                        color="success"
                                        variant="flat"
                                    >
                                        Excel
                                    </Chip>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        color="danger"
                                        variant="light"
                                        onPress={() => removeFile(index)}
                                    >
                                        <BiX />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Resumen */}
            {files.length > 0 && (
                <Card>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                Total de archivos:
                            </span>
                            <Chip color="primary" variant="flat">
                                {files.length} archivo(s)
                            </Chip>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
});

export default FormCargarExcel;
