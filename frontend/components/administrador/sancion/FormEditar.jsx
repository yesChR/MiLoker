import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Input, Form, Select, SelectItem } from "@heroui/react";
import { ESTADOS } from "../../common/estados";
import { Chip } from "@heroui/react";

const FormEditar = forwardRef(({ selectedItem, setSelectedItem, sanciones, onSubmit }, ref) => {
    const [showErrors, setShowErrors] = useState(false);
    const [duplicado, setDuplicado] = useState(false);


    const validateAndSubmit = () => {
        setShowErrors(true);
        setDuplicado(false);
        if (
            !selectedItem?.gravedad?.trim() ||
            !selectedItem?.detalle?.trim() ||
            (selectedItem.estado !== 0 && !selectedItem.estado)
        ) {
            return false;
        }
        // Validar duplicado de gravedad (ignorando el propio id)
        const gravedadDuplicada = sanciones?.some(s =>
            s.gravedad.trim().toLowerCase() === selectedItem.gravedad.trim().toLowerCase() &&
            (s.idSancion || s.id) !== selectedItem.id
        );
        if (gravedadDuplicada) {
            setDuplicado(true);
            return false;
        }
        // Si hay onSubmit, llamarlo
        if (onSubmit) {
            onSubmit(selectedItem);
        }
        return true;
    };

    useImperativeHandle(ref, () => ({
        validateAndSubmit
    }));

    return (
        <Form autoComplete="off">
            <Input
                label="Gravedad"
                placeholder="Muy alta"
                isRequired
                value={selectedItem ? selectedItem.gravedad : ""}
                onChange={(e) => {
                    setSelectedItem((prev) => ({
                        ...prev,
                        gravedad: e.target.value,
                    }));
                    if (showErrors) setShowErrors(false);
                    if (duplicado) setDuplicado(false);
                }}
                variant={"bordered"}
                className="focus:border-primario"
                color={showErrors && (!selectedItem?.gravedad?.trim() || duplicado) ? "danger" : "primary"}
                isInvalid={showErrors && (!selectedItem?.gravedad?.trim() || duplicado)}
                errorMessage={
                    duplicado
                        ? "Ya existe una gravedad con ese nombre"
                        : "La gravedad es obligatoria"
                }
            />

            <div className="relative w-full mt-4">
                <textarea
                    placeholder=" "
                    className={`border-2 rounded-2xl p-2 pt-7 pl-3 w-full h-32 resize-y placeholder:text-sm text-sm text-gray-600 focus:border-blue-500 focus:outline-none peer border-gray-300`}
                    value={selectedItem ? selectedItem.detalle : ""}
                    onChange={e => setSelectedItem(prev => ({ ...prev, detalle: e.target.value }))}
                    required
                />
                <label className={`absolute left-3 top-2 text-base pointer-events-none transition-all duration-200
                    text-xs top-2
                    ${showErrors && !selectedItem?.detalle?.trim() ? 'text-danger' : 'text-primario'}
                    `}
                > Detalle<span className={`${showErrors && !selectedItem?.detalle?.trim() ? 'text-danger' : 'text-danger'}`}>*</span></label>
                {showErrors && !selectedItem?.detalle?.trim() && (
                    <div className="text-danger text-xs mt-1">El detalle es obligatorio</div>
                )}
            </div>

            <Select
                isRequired
                label="Estado"
                name="estado"
                selectedKeys={selectedItem?.estado !== undefined && selectedItem?.estado !== null && selectedItem?.estado !== "" ? [selectedItem.estado.toString()] : []}
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
                isInvalid={showErrors && (selectedItem?.estado !== 0 && !selectedItem?.estado)}
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
