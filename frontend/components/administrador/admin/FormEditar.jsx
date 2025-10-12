import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Input, Form, Select, SelectItem, Chip } from "@heroui/react";
import { ESTADOS } from "../../common/estados";

const FormEditar = forwardRef(({ selectedItem, setSelectedItem, onSubmit }, ref) => {
    const [showErrors, setShowErrors] = useState(false);
    
    const validateAndSubmit = () => {
        // Activar la visualización de errores
        setShowErrors(true);
        
        // Validar campos requeridos (incluyendo cédula aunque esté deshabilitada)
        const requiredFields = ['cedula', 'nombre', 'apellidoUno', 'apellidoDos', 'correo', 'telefono'];
        const emptyFields = requiredFields.filter(field => {
            const value = selectedItem?.[field];
            return !value || !value.toString().trim();
        });
        
        // Validar que el estado esté seleccionado
        if (!selectedItem?.estado && selectedItem?.estado !== 0) {
            emptyFields.push('estado');
        }
        
        if (emptyFields.length > 0) {
            // No enviar si hay campos vacíos
            return false;
        }
        
        // Llamar la función onSubmit si se proporciona y todos los campos están llenos
        if (onSubmit) {
            const formData = {
                cedula: selectedItem.cedula,
                nombre: selectedItem.nombre,
                apellidoUno: selectedItem.apellidoUno,
                apellidoDos: selectedItem.apellidoDos,
                correo: selectedItem.correo,
                telefono: selectedItem.telefono,
                estado: selectedItem.estado
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
        <Form
            className="w-full flex flex-col gap-4"
            onSubmit={handleSubmit}
            autoComplete="off"
        >
            <Input
                label="Cédula"
                name="cedula"
                value={selectedItem?.cedula || ""}
                onChange={(e) =>
                    setSelectedItem((prev) => ({
                        ...prev,
                        cedula: e.target.value,
                    }))
                }
                variant="bordered"
                className="focus:border-primario"
                color="primary"
                isDisabled
                isInvalid={showErrors && !selectedItem?.cedula?.trim()}
                errorMessage="La cédula es obligatoria"
            />
            <Input
                isRequired
                label="Nombre"
                name="nombre"
                value={selectedItem?.nombre || ""}
                onChange={(e) =>
                    setSelectedItem((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                    }))
                }
                variant="bordered"
                className="focus:border-primario"
                color="primary"
                isInvalid={showErrors && !selectedItem?.nombre?.trim()}
                errorMessage="El nombre es obligatorio"
            />
            <Input
                isRequired
                label="Primer apellido"
                name="apellidoUno"
                value={selectedItem?.apellidoUno || ""}
                onChange={(e) =>
                    setSelectedItem((prev) => ({
                        ...prev,
                        apellidoUno: e.target.value,
                    }))
                }
                variant="bordered"
                className="focus:border-primario"
                color="primary"
                isInvalid={showErrors && !selectedItem?.apellidoUno?.trim()}
                errorMessage="El primer apellido es obligatorio"
            />
            <Input
                isRequired
                label="Segundo apellido"
                name="apellidoDos"
                value={selectedItem?.apellidoDos || ""}
                onChange={(e) =>
                    setSelectedItem((prev) => ({
                        ...prev,
                        apellidoDos: e.target.value,
                    }))
                }
                variant="bordered"
                className="focus:border-primario"
                color="primary"
                isInvalid={showErrors && !selectedItem?.apellidoDos?.trim()}
                errorMessage="El segundo apellido es obligatorio"
            />
            <Input
                isRequired
                label="Correo"
                name="correo"
                value={selectedItem?.correo || ""}
                onChange={(e) =>
                    setSelectedItem((prev) => ({
                        ...prev,
                        correo: e.target.value,
                    }))
                }
                variant="bordered"
                className="focus:border-primario"
                color="primary"
                type="email"
                isDisabled
                isInvalid={showErrors && !selectedItem?.correo?.trim()}
                errorMessage="El correo es obligatorio"
            />
            <Input
                isRequired
                label="Teléfono"
                name="telefono"
                value={selectedItem?.telefono || ""}
                onChange={(e) =>
                    setSelectedItem((prev) => ({
                        ...prev,
                        telefono: e.target.value,
                    }))
                }
                variant="bordered"
                type="tel"
                pattern="^(?:\+506\s?)?[26-9]\d{3}-?\d{4}$"
                className="focus:border-primario"
                color="primary"
                isInvalid={showErrors && !selectedItem?.telefono?.trim()}
                errorMessage="El teléfono es obligatorio"
            />
            <Select
                isRequired
                label="Estado"
                name="estado"
                selectedKeys={selectedItem?.estado ? [selectedItem.estado.toString()] : []}
                onSelectionChange={(keys) => {
                    const selectedValue = Array.from(keys)[0];
                    setSelectedItem((prev) => ({
                        ...prev,
                        estado: parseInt(selectedValue),
                    }));
                }}
                variant="bordered"
                className="focus:border-primario"
                color="primary"
                isInvalid={showErrors && (!selectedItem?.estado && selectedItem?.estado !== 0)}
                errorMessage="El estado es obligatorio"
            >
                <SelectItem key={ESTADOS.ACTIVO} value={ESTADOS.ACTIVO} textValue="Activo">
                    <div className="flex items-center gap-2">
                        <Chip color="success" variant="flat" size="sm">
                            Activo
                        </Chip>
                    </div>
                </SelectItem>
                <SelectItem key={ESTADOS.INACTIVO} value={ESTADOS.INACTIVO} textValue="Inactivo">
                    <div className="flex items-center gap-2">
                        <Chip color="danger" variant="flat" size="sm">
                            Inactivo
                        </Chip>
                    </div>
                </SelectItem>
            </Select>
        </Form>
    );
});

FormEditar.displayName = "FormEditar";

export default FormEditar;