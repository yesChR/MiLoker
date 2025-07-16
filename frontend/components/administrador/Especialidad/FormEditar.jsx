import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Input, Form, Select, SelectItem, Chip } from "@heroui/react";
import { ESTADOS } from "../../common/estados";

const FormEditar = forwardRef(({ selectedItem, setSelectedItem, especialidades }, ref) => {
    const [showErrors, setShowErrors] = useState(false);
    const [nombreDuplicado, setNombreDuplicado] = useState(false);

    const validateAndSubmit = () => {
        setShowErrors(true);
        setNombreDuplicado(false);

        const requiredFields = ['nombre', 'estado'];
        const emptyFields = requiredFields.filter(field => {
            const value = selectedItem?.[field];
            return !value || !value.toString().trim();
        });

        if (!selectedItem?.estado && selectedItem?.estado !== 0) {
            emptyFields.push('estado');
        }

        if (emptyFields.length > 0) {
            return false;
        }

        // Validar nombre duplicado (ignorando el propio id)
        const nombreNormalizado = selectedItem.nombre.trim().toLowerCase();
        const existe = especialidades?.some(e =>
            e.nombre.trim().toLowerCase() === nombreNormalizado &&
            (e.idEspecialidad || e.id || e._id) !== selectedItem.id
        );
        if (existe) {
            setNombreDuplicado(true);
            return false;
        }
        return true;
    };


    useImperativeHandle(ref, () => ({
        validateAndSubmit
    }));

    return (
        <Form
            className="w-full flex flex-col gap-4"
            autoComplete="off"
        >
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
            <Select
                isRequired
                label="Estado"
                name="estado"
                selectedKeys={selectedItem?.estado ? [selectedItem.estado.toString()] : []}
                onSelectionChange={(keys) => {
                    const selectedValue = Number(Array.from(keys)[0]);
                    setSelectedItem((prev) => ({
                        ...prev,
                        estado: selectedValue,
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

export default FormEditar;