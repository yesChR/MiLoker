import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Input, Form } from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";


const FormCrear = forwardRef(({
    selectedItem,
    setSelectedItem,
    especialidades = [],
    setEspecialidad,
    onSubmit
}, ref) => {
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
            onSubmit={handleSubmit}>
            <Input
                label="Cédula"
                placeholder="70987654"
                value={selectedItem?.cedula || ""}
                onChange={(e) =>
                    setSelectedItem((prev) => ({
                        ...prev,
                        cedula: e.target.value,
                    }))
                }
                variant={"bordered"}
                className="focus:border-primario"
                color="primary"
            />
            <Input
                label="Nombre"
                placeholder="Maria"
                value={selectedItem?.nombre || ""}
                onChange={(e) =>
                    setSelectedItem((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                    }))
                }
                variant={"bordered"}
                className="focus:border-primario"
                color="primary"
            />
            <Input
                label="Primer apellido"
                placeholder="Rojas"
                value={selectedItem?.apellidoUno || ""}
                onChange={(e) =>
                    setSelectedItem((prev) => ({
                        ...prev,
                        apellidoUno: e.target.value,
                    }))
                }
                variant={"bordered"}
                className="focus:border-primario"
                color="primary"
            />
            <Input
                label="Segundo apellido"
                placeholder="Gómez"
                value={selectedItem?.apellidoDos || ""}
                onChange={(e) =>
                    setSelectedItem((prev) => ({
                        ...prev,
                        apellidoDos: e.target.value,
                    }))
                }
                variant={"bordered"}
                className="focus:border-primario"
                color="primary"
            />
            <Input
                label="Correo"
                placeholder="maria@gmail.com"
                value={selectedItem?.correo || ""}
                onChange={(e) =>
                    setSelectedItem((prev) => ({
                        ...prev,
                        correo: e.target.value,
                    }))
                }
                variant={"bordered"}
                className="focus:border-primario"
                color="primary"
            />
            <Input
                label="Teléfono"
                placeholder="67453212"
                value={selectedItem?.telefono || ""}
                onChange={(e) =>
                    setSelectedItem((prev) => ({
                        ...prev,
                        telefono: e.target.value,
                    }))
                }
                variant={"bordered"}
                type={"tel"}
                pattern="^(?:\+506\s?)?[26-9]\d{3}-?\d{4}$"
                className="focus:border-primario"
                color="primary"
            />
            <Select
                label="Especialidad"
                placeholder="Seleccione especialidad"
                selectedKeys={selectedItem?.idEspecialidad ? [selectedItem.idEspecialidad.toString()] : []}
                onSelectionChange={(keys) => {
                    const selectedValue = Array.from(keys)[0];
                    setEspecialidad(selectedValue);
                    setSelectedItem((prev) => ({
                        ...prev,
                        idEspecialidad: selectedValue
                    }));
                }}
                variant="bordered"
                className="focus:border-primario mt-2"
                color="primary"
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
        </Form>
    );
});

export default FormCrear;