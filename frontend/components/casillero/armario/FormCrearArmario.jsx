import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Input, Select, SelectItem } from "@heroui/react";

const FormCrearArmario = forwardRef(({ selectedItem, setSelectedItem, onSubmit, especialidades, loading }, ref) => {
    const [showErrors, setShowErrors] = useState(false);
    
    const validateAndSubmit = () => {
        // Activar la visualización de errores
        setShowErrors(true);
        
        // Validar campos requeridos
        const requiredFields = ['idArmario', 'numFilas', 'numColumnas', 'idEspecialidad'];
        const emptyFields = requiredFields.filter(field => {
            const value = selectedItem?.[field];
            return !value || !value.toString().trim();
        });
        
        if (emptyFields.length > 0) {
            // No enviar si hay campos vacíos
            return false;
        }
        
        // Llamar la función onSubmit si se proporciona y todos los campos están llenos
        if (onSubmit) {
            const formData = {
                idArmario: selectedItem.idArmario,
                numFilas: parseInt(selectedItem.numFilas),
                numColumnas: parseInt(selectedItem.numColumnas),
                idEspecialidad: parseInt(selectedItem.idEspecialidad)
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

    const handleFormChange = (field, value) => {
        setSelectedItem(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <form
            className="w-full flex flex-col gap-4"
            onSubmit={handleSubmit}
        >
            <Input
                isRequired
                label="ID Armario"
                name="idArmario"
                placeholder="A"
                value={selectedItem?.idArmario || ""}
                onChange={(e) => handleFormChange('idArmario', e.target.value)}
                variant="bordered"
                className="focus:border-primario"
                color="primary"
                isInvalid={showErrors && !selectedItem?.idArmario?.trim()}
                errorMessage="El ID del armario es obligatorio"
                isDisabled={loading}
            />
            
            <Select
                isRequired
                label="Especialidad"
                placeholder="Seleccione especialidad"
                selectedKeys={selectedItem?.idEspecialidad ? [selectedItem.idEspecialidad.toString()] : []}
                onSelectionChange={(keys) => {
                    const selectedValue = Array.from(keys)[0];
                    handleFormChange('idEspecialidad', selectedValue || '');
                }}
                variant="bordered"
                className="focus:border-primario"
                color="primary"
                isInvalid={showErrors && (!selectedItem?.idEspecialidad || !selectedItem.idEspecialidad.toString().trim())}
                errorMessage="La especialidad es obligatoria"
                isDisabled={loading}
            >
                {especialidades.map((esp) => {
                    const nombreFormateado = esp.nombre
                        ? esp.nombre.charAt(0).toUpperCase() + esp.nombre.slice(1).toLowerCase()
                        : "";
                    return (
                        <SelectItem
                            key={esp.idEspecialidad}
                            value={esp.idEspecialidad.toString()}
                            textValue={nombreFormateado}
                        >
                            {nombreFormateado}
                        </SelectItem>
                    );
                })}
            </Select>
            
            <Input
                isRequired
                type="number"
                label="Filas"
                name="numFilas"
                placeholder="4"
                value={selectedItem?.numFilas || ""}
                onChange={(e) => handleFormChange('numFilas', e.target.value)}
                variant="bordered"
                className="focus:border-primario"
                color="primary"
                isInvalid={showErrors && !selectedItem?.numFilas}
                errorMessage="El número de filas es obligatorio"
                isDisabled={loading}
                min="1"
                max="10"
            />
            
            <Input
                isRequired
                type="number"
                label="Columnas"
                name="numColumnas"
                placeholder="3"
                value={selectedItem?.numColumnas || ""}
                onChange={(e) => handleFormChange('numColumnas', e.target.value)}
                variant="bordered"
                className="focus:border-primario"
                color="primary"
                isInvalid={showErrors && !selectedItem?.numColumnas}
                errorMessage="El número de columnas es obligatorio"
                isDisabled={loading}
                min="1"
                max="10"
            />
        </form>
    );
});

FormCrearArmario.displayName = "FormCrearArmario";

export default FormCrearArmario;
