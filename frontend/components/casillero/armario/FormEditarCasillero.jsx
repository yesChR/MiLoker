import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Input, Select, SelectItem } from "@heroui/react";

const FormEditarCasillero = forwardRef(({ selectedItem, setSelectedItem, onSubmit, estadosCasillero, loading }, ref) => {
    const [showErrors, setShowErrors] = useState(false);
    
    const validateAndSubmit = () => {
        // Activar la visualización de errores
        setShowErrors(true);
        
        // Para casilleros, el detalle es opcional, solo validamos que existan los datos básicos
        if (!selectedItem?.id && !selectedItem?.idCasillero) {
            return false;
        }
        
        // Llamar la función onSubmit si se proporciona
        if (onSubmit) {
            const formData = {
                detalle: selectedItem.descripcion || '',
                idEstadoCasillero: selectedItem.estado
            };
            onSubmit(formData);
            return true;
        }
        return false;
    };

    // Exponer la función de validación al componente padre
    useImperativeHandle(ref, () => ({
        validateAndSubmit
    }));
    
    const handleSubmit = (e) => {
        e.preventDefault();
        validateAndSubmit();
    };

    return (
        <form
            className="w-full flex flex-col gap-4"
            onSubmit={handleSubmit}
        >
            <Input
                label="ID Casillero"
                name="idCasillero"
                value={selectedItem?.id?.toString() || ''}
                disabled
                variant="bordered"
                className="focus:border-primario"
                color="primary"
                isRequired
            />
            
            <Select
                label="Estado"
                placeholder="Seleccione..."
                variant="bordered"
                className="focus:border-primario"
                color="primary"
                selectedKeys={selectedItem?.estado ? [selectedItem.estado.toString()] : []}
                onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0];
                    setSelectedItem(prev => ({ 
                        ...prev, 
                        estado: selected ? parseInt(selected) : 1 
                    }));
                }}
                isDisabled={loading}
                isRequired
                errorMessage="El estado es obligatorio"
            >
                {estadosCasillero.map((estado) => (
                    <SelectItem 
                        key={estado.idEstadoCasillero} 
                        value={estado.idEstadoCasillero.toString()}
                    >
                        {estado.nombre}
                    </SelectItem>
                ))}
            </Select>
            
            <div className="relative w-full">
                <textarea
                    placeholder="Escriba aquí..."
                    className="border-2 rounded-2xl p-2 pt-7 pl-3 w-full h-32 resize-y placeholder:text-sm text-sm text-gray-800 focus:border-blue-500 focus:outline-none peer border-gray-300"
                    value={selectedItem?.descripcion || ''}
                    onChange={e => setSelectedItem(prev => ({ ...prev, descripcion: e.target.value }))}
                    disabled={loading}
                />
                <label className="absolute left-3 top-2 text-base pointer-events-none transition-all duration-200 text-xs top-2 text-primario">
                    Detalle
                </label>
            </div>
        </form>
    );
});

FormEditarCasillero.displayName = "FormEditarCasillero";

export default FormEditarCasillero;
