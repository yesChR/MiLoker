import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Input, Form } from "@heroui/react";

const FormCrear = forwardRef(({ selectedItem, setSelectedItem, especialidades }, ref) => {
    const [showErrors, setShowErrors] = useState(false);
    const [nombreDuplicado, setNombreDuplicado] = useState(false);

    const validateAndSubmit = () => {
        setShowErrors(true);
        setNombreDuplicado(false);
        if (!selectedItem?.nombre || !selectedItem?.nombre.trim()) {
            return false;
        }
        // Validar nombre duplicado
        const nombreNormalizado = selectedItem.nombre.trim().toLowerCase();
        const existe = especialidades?.some(e => e.nombre.trim().toLowerCase() === nombreNormalizado);
        if (existe) {
            setNombreDuplicado(true);
            return false;
        }
        return true;
    };

    useImperativeHandle(ref, () => ({
        validateAndSubmit
    }));

    // No submit interno, solo renderiza el formulario
    return (
        <Form autoComplete="off">
            <Input
                label="Nombre"
                placeholder="Salud Ocupacional"
                isRequired
                value={selectedItem ? selectedItem.nombre : ""}
                onChange={(e) => {
                    setSelectedItem((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                    }));
                    if (showErrors) setShowErrors(false);
                    if (nombreDuplicado) setNombreDuplicado(false);
                }}
                variant={"bordered"}
                className="focus:border-primario"
                color={showErrors && (!selectedItem?.nombre?.trim() || nombreDuplicado) ? "danger" : "primary"}
                isInvalid={showErrors && (!selectedItem?.nombre?.trim() || nombreDuplicado)}
                errorMessage={
                    nombreDuplicado
                        ? "Ya existe una especialidad con ese nombre"
                        : "El nombre es obligatorio"
                }
            />
        </Form>
    );
});

export default FormCrear;