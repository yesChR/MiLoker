import React, { useState } from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { BiFile, BiX, BiChevronDown, BiChevronUp } from "react-icons/bi";

const ListaArchivos = ({ files, onRemoveFile, formatFileSize }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    if (files.length === 0) return null;

    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardBody className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xs">✓</span>
                        </span>
                        Archivos seleccionados
                    </h4>
                    <div className="flex items-center gap-2">
                        <Chip color="success" variant="flat" size="sm">
                            {files.length} archivo{files.length > 1 ? 's' : ''}
                        </Chip>
                        <Button
                            variant="light"
                            size="sm"
                            onPress={toggleExpanded}
                            startContent={isExpanded ? <BiChevronUp className="text-sm" /> : <BiChevronDown className="text-sm" />}
                            className="text-primary font-medium text-xs px-2 min-w-unit-16 h-7"
                        >
                            {isExpanded ? 'Ocultar' : 'Ver archivos'}
                        </Button>
                    </div>
                </div>
                
                {/* Lista de archivos desplegable */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded 
                        ? 'max-h-screen opacity-100' 
                        : 'max-h-0 opacity-0'
                }`}>
                    <div className="space-y-2">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="group flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 hover:from-primary/5 hover:to-primary/10 rounded-lg p-3 transition-all duration-300 hover:shadow-md"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                    <BiFile className="text-green-600 text-sm" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors truncate">
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
                                    className="font-medium text-xs"
                                >
                                    Excel
                                </Chip>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    color="danger"
                                    variant="light"
                                    onPress={() => onRemoveFile(index)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-danger/10"
                                >
                                    <BiX className="text-base" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default ListaArchivos;
