import React, { useState, useImperativeHandle, forwardRef, useCallback } from "react";
import InstruccionesExcel from "./InstruccionesExcel";
import ZonaDragDrop from "./ZonaDragDrop";
import ListaArchivos from "./ListaArchivos";
import ResumenCarga from "./ResumenCarga";

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
            {/* Componente de instrucciones */}
            <InstruccionesExcel />

            {/* Componente de zona de drag and drop */}
            <ZonaDragDrop
                dragActive={dragActive}
                showErrors={showErrors}
                files={files}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onFileChange={handleFileChange}
            />

            {/* Componente de resumen */}
            <ResumenCarga files={files} />
            
            {/* Componente de lista de archivos */}
            <ListaArchivos
                files={files}
                onRemoveFile={removeFile}
                formatFileSize={formatFileSize}
            />

        </div>
    );
});

export default FormCargarExcel;
