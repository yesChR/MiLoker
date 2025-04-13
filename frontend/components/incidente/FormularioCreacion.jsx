import React, { useRef } from "react";
import { Select, Button } from "@heroui/react";
import { PlusIcon } from "../icons/PlusIcon";

const FormularioCreacion = () => {
    const fileInputRef1 = useRef(null);
    const fileInputRef2 = useRef(null);

    const handleFileSelect = (ref) => {
        if (ref.current) {
            ref.current.click(); // Simula un clic en el input de archivo
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log("Archivo seleccionado:", file.name);
        }
    };

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <Select
                    placeholder="Armario"
                    variant={"bordered"}
                    className="focus:border-primario"
                    color="primary"
                />
                <Select
                    placeholder="Casillero"
                    variant={"bordered"}
                    className="focus:border-primario"
                    color="primary"
                />
            </div>
            <textarea
                placeholder="Describa el incidente..."
                className="focus:outline-none focus:ring-2 focus:ring-primary border-2 rounded-xl p-2 w-full placeholder:text-sm text-gray-900 mb-4"
                color="primary"
            />
            <label className="text-gray-500 text-sm mb-2 block">Comparta la evidencia (Opcional):</label>
            <div className="grid grid-cols-2 gap-4">
                {/* Div para el primer archivo */}
                <div
                    className="border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center h-32 cursor-pointer hover:bg-blue-50"
                    onClick={() => handleFileSelect(fileInputRef1)}
                >
                    <PlusIcon className="text-blue-400 w-10 h-10" />
                    <input
                        type="file"
                        ref={fileInputRef1}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Div para el segundo archivo */}
                <div
                    className="border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center h-32 cursor-pointer hover:bg-blue-50"
                    onClick={() => handleFileSelect(fileInputRef2)}
                >
                    <PlusIcon className="text-blue-400 w-10 h-10" />
                    <input
                        type="file"
                        ref={fileInputRef2}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default FormularioCreacion;