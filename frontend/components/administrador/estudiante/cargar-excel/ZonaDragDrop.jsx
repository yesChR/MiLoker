import React from "react";
import { Button } from "@heroui/react";
import { BiUpload, BiFile } from "react-icons/bi";

const ZonaDragDrop = ({ 
    dragActive, 
    showErrors, 
    files, 
    onDragEnter, 
    onDragLeave, 
    onDragOver, 
    onDrop, 
    onFileChange 
}) => {
    return (
        <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive 
                    ? 'border-primary bg-primary/10 scale-105 shadow-lg' 
                    : showErrors && files.length === 0
                        ? 'border-danger bg-danger/5 shadow-md'
                        : 'border-gray-300 hover:border-primary hover:bg-gray-50 hover:shadow-md'
            }`}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            {/* Fondo decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent rounded-xl pointer-events-none" />
            
            <div className="relative">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                    dragActive ? 'bg-primary/20 scale-110' : 'bg-gray-100'
                }`}>
                    <BiUpload className={`text-3xl transition-colors duration-300 ${
                        dragActive ? 'text-primary' : 'text-gray-400'
                    }`} />
                </div>
                
                <div className="space-y-2">
                    <h4 className={`text-lg font-bold transition-colors duration-300 ${
                        dragActive ? 'text-primary' : 'text-gray-700'
                    }`}>
                        {dragActive ? '¡Suelta los archivos aquí!' : 'Arrastra archivos Excel'}
                    </h4>
                    
                    <p className="text-sm text-gray-500">
                        Acepta archivos .xlsx y .xls
                    </p>
                    
                    <div className="flex items-center justify-center space-x-4 my-4">
                        <div className="h-px bg-gray-300 flex-1 max-w-16"></div>
                        <span className="text-xs text-gray-400 font-medium">O</span>
                        <div className="h-px bg-gray-300 flex-1 max-w-16"></div>
                    </div>
                    
                    <input
                        type="file"
                        multiple
                        accept=".xlsx,.xls"
                        onChange={onFileChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <Button
                        as="label"
                        htmlFor="file-upload"
                        color="primary"
                        variant="solid"
                        size="md"
                        startContent={<BiFile />}
                        className="cursor-pointer font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Seleccionar archivos
                    </Button>
                </div>
            </div>
            
            {showErrors && files.length === 0 && (
                <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-danger-50 border border-danger-200 rounded-lg p-2">
                        <p className="text-sm text-danger font-medium flex items-center gap-2">
                            <span>⚠️</span>
                            Selecciona al menos un archivo Excel
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ZonaDragDrop;
