import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Input, Form } from "@heroui/react";

const FormCrear = forwardRef(({ selectedItem, setSelectedItem, onSubmit }, ref) => {
    const [showErrors, setShowErrors] = useState(false);
    
    const validateAndSubmit = () => {
        // Activar la visualización de errores
        setShowErrors(true);
        
        // Validar campos requeridos
        const requiredFields = ['cedula', 'nombre', 'apellidoUno', 'apellidoDos', 'correo'];
        const emptyFields = requiredFields.filter(field => {
            const value = selectedItem?.[field];
            return !value || !value.trim();
        });
        
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
                telefono: selectedItem.telefono || ""
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
        >
            <Input
                isRequired
                label="Cédula"
                name="cedula"
                placeholder="70123987"
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
                isInvalid={showErrors && !selectedItem?.cedula?.trim()}
                errorMessage="La cédula es obligatoria"
            />
            <Input
                isRequired
                label="Nombre"
                name="nombre"
                placeholder="Juan"
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
                placeholder="López"
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
                placeholder="Gómez"
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
                placeholder="juan@gmail.com"
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
                isInvalid={showErrors && !selectedItem?.correo?.trim()}
                errorMessage="El correo es obligatorio"
            />
            <Input
                isRequired
                label="Teléfono"
                name="telefono"
                placeholder="62345677"
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
        </Form>
    );
});

FormCrear.displayName = "FormCrear";

export default FormCrear;