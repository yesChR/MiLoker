import React, { useState } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";

const InstruccionesExcel = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };
    return (
        <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-primary/10">
            <CardBody className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-lg text-white">📚</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="mb-3">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">
                                Instrucciones para cargar estudiantes
                            </h3>
                            <div className="flex justify-start">
                                <Button
                                    variant="light"
                                    size="sm"
                                    onPress={toggleExpanded}
                                    startContent={isExpanded ? <BiChevronUp className="text-sm" /> : <BiChevronDown className="text-sm" />}
                                    className="text-primary font-medium text-xs px-2 min-w-unit-16 h-7"
                                >
                                    {isExpanded ? 'Ocultar' : 'Ver más'}
                                </Button>
                            </div>
                        </div>
                        
                        {/* Contenido desplegable */}
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isExpanded 
                                ? 'max-h-screen opacity-100' 
                                : 'max-h-0 opacity-0'
                        }`}>
                            <div className="space-y-3 pt-3">
                            <div className="flex items-start gap-2 p-2 rounded-md hover:bg-white/30 transition-colors">
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-green-600 text-xs font-bold">1</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800 mb-1">Formato de archivo</p>
                                    <p className="text-xs text-gray-600">Solo archivos Excel (.xlsx o .xls)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 p-2 rounded-md hover:bg-white/30 transition-colors">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 text-xs font-bold">2</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800 mb-1">Múltiples archivos</p>
                                    <p className="text-xs text-gray-600">Puedes cargar varios archivos simultáneamente</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 p-2 rounded-md hover:bg-white/30 transition-colors">
                                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-yellow-600 text-xs font-bold">3</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800 mb-1">Estructura de datos</p>
                                    <p className="text-xs text-gray-600">Los datos deben empezar desde la fila 6</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 p-2 rounded-md hover:bg-white/30 transition-colors">
                                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-purple-600 text-xs font-bold">4</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800 mb-1">Usuarios automáticos</p>
                                    <p className="text-xs text-gray-600">Se crean usuarios para estudiantes nuevos</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 p-2 rounded-md hover:bg-white/30 transition-colors">
                                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-orange-600 text-xs font-bold">5</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800 mb-1">Estudiantes existentes</p>
                                    <p className="text-xs text-gray-600">Solo se actualiza la sección si ya existe</p>
                                </div>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-4">
                                <div className="flex items-start gap-2">
                                    <span className="text-amber-600">⚠️</span>
                                    <div>
                                        <p className="text-sm text-amber-800 mb-1">Consejo importante</p>
                                        <p className="text-xs text-amber-700">Verifica que los datos estén correctos antes de cargar</p>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default InstruccionesExcel;
