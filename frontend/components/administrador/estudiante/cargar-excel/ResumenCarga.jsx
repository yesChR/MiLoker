import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";

const ResumenCarga = ({ files }) => {
    if (files.length === 0) return null;

    return (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
            <CardBody className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">📊</span>
                        </div>
                        <div>
                            <h5 className="font-bold text-gray-800 text-sm">Resumen de carga</h5>
                            <p className="text-xs text-gray-600">Todo listo para procesar</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-center">
                            <Chip color="primary" variant="solid" size="sm" className="font-bold">
                                {files.length}
                            </Chip>
                            <p className="text-xs text-gray-600 mt-1">
                                Archivo{files.length > 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="text-center">
                            <Chip color="success" variant="flat" size="sm" className="font-bold">
                                ✓ Listo
                            </Chip>
                            <p className="text-xs text-gray-600 mt-1">Estado</p>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default ResumenCarga;
