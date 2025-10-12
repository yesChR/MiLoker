import React from 'react';
import { Card, CardBody, CardHeader, Chip, User, Divider } from "@heroui/react";
import { FiUsers, FiPhone, FiMail, FiUserCheck } from 'react-icons/fi';
import { HiOutlineEmojiSad } from 'react-icons/hi';

const EncargadosInfo = ({ encargados = [] }) => {
    // Si no hay encargados, mostrar mensaje elegante
    if (!encargados || encargados.length === 0) {
        return (
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-200 rounded-xl">
                            <HiOutlineEmojiSad className="text-orange-600 text-xl" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-orange-800">
                                Sin Encargados Registrados
                            </h4>
                            <p className="text-sm text-orange-600">
                                Este estudiante no tiene encargados asignados
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="pt-0">
                    <div className="flex items-center justify-center py-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                <FiUsers className="text-orange-500 text-2xl" />
                            </div>
                            <p className="text-orange-700 font-medium">
                                No hay información de contacto disponible
                            </p>
                            <p className="text-sm text-orange-600 mt-1">
                                Se recomienda contactar al estudiante directamente
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>
        );
    }

    // Si hay encargados, mostrarlos de forma elegante
    return (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-200 rounded-xl">
                        <FiUsers className="text-blue-600 text-xl" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-blue-800">
                            Encargados del Estudiante
                        </h4>
                        <p className="text-sm text-blue-600">
                            {encargados.length === 1 ? 'Persona de contacto' : `${encargados.length} personas de contacto`}
                        </p>
                    </div>
                    <div className="ml-auto">
                        <Chip 
                            color="primary" 
                            variant="flat" 
                            size="sm"
                            startContent={<FiUserCheck className="text-sm" />}
                        >
                            {encargados.length} {encargados.length === 1 ? 'Encargado' : 'Encargados'}
                        </Chip>
                    </div>
                </div>
            </CardHeader>
            <CardBody className="pt-0">
                <div className="space-y-3">
                    {encargados.map((encargado, index) => (
                        <div key={encargado.cedula || index}>
                            <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-200">
                                {/* Información del encargado sin avatar */}
                                <div className="w-full">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <h5 className="font-semibold text-gray-800 text-sm truncate">
                                                {`${encargado.nombre || 'Sin nombre'} ${encargado.apellidoUno || ''} ${encargado.apellidoDos || ''}`.trim()}
                                            </h5>
                                            {encargado.parentesco && (
                                                <Chip 
                                                    color="secondary" 
                                                    variant="flat" 
                                                    size="sm"
                                                    className="text-xs"
                                                >
                                                    {encargado.parentesco}
                                                </Chip>
                                            )}
                                        </div>

                                        {/* Información de contacto - Layout vertical */}
                                        <div className="space-y-2">
                                            {/* Teléfono */}
                                            {encargado.telefono && (
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-green-100 rounded-lg flex-shrink-0">
                                                        <FiPhone className="text-green-600 text-sm" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500 uppercase font-medium">
                                                                TELÉFONO
                                                            </span>
                                                            <span className="text-sm font-semibold text-gray-800">
                                                                {encargado.telefono}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Email */}
                                            {encargado.correo && (
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-purple-100 rounded-lg flex-shrink-0">
                                                        <FiMail className="text-purple-600 text-sm" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500 uppercase font-medium">
                                                                CORREO
                                                            </span>
                                                            <span className="text-sm font-semibold text-gray-800 break-all">
                                                                {encargado.correo}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Cédula si está disponible */}
                                        {encargado.cedula && (
                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                <p className="text-xs text-gray-500">
                                                    <span className="font-medium">Cédula:</span> {encargado.cedula}
                                                </p>
                                            </div>
                                        )}
                                </div>
                            </div>
                            
                            {/* Divider entre encargados (excepto el último) */}
                            {index < encargados.length - 1 && (
                                <Divider className="my-2" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer con información adicional */}
                <div className="mt-3 pt-3 border-t border-blue-100">
                    <p className="text-xs text-blue-600 text-center">
                        💡 Esta información es confidencial y solo debe ser utilizada para contacto académico
                    </p>
                </div>
            </CardBody>
        </Card>
    );
};

export default EncargadosInfo;