import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Input, Form, Select, SelectItem, Chip } from "@heroui/react";
import { ESTADOS } from "../../common/estados";

const FormCrear = forwardRef(({ selectedItem, setSelectedItem, sanciones }, ref) => {
    const [showErrors, setShowErrors] = useState(false);
    const [duplicado, setDuplicado] = useState(false);

    const validateAndSubmit = () => {
        setShowErrors(true);
        setDuplicado(false);
        if (!selectedItem?.gravedad || !selectedItem?.detalle || selectedItem.estado === undefined) {
            return false;
        }
        // Validar duplicado (gravedad + detalle)
        const existe = sanciones?.some(s =>
            s.gravedad.trim().toLowerCase() === selectedItem.gravedad.trim().toLowerCase() &&
            s.detalle.trim().toLowerCase() === selectedItem.detalle.trim().toLowerCase()
        );
        if (existe) {
            setDuplicado(true);
            return false;
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
                placeholder="Gravedad"
                isRequired
                value={selectedItem ? selectedItem.gravedad : ""}
                onChange={e => setSelectedItem(prev => ({ ...prev, gravedad: e.target.value }))}
                status={showErrors && !selectedItem?.gravedad ? "error" : undefined}
                errorMessage={showErrors && !selectedItem?.gravedad ? "La gravedad es obligatoria" : undefined}
            />
            <textarea
                placeholder="Detalle de la sanción"
                className="border-2 border-gray-300 rounded-2xl p-2 w-full h-32 resize-none focus:border-blue-500 hover:border-gray-400 placeholder:text-sm text-gray-900 mt-4"
                value={selectedItem ? selectedItem.detalle : ""}
                onChange={e => setSelectedItem(prev => ({ ...prev, detalle: e.target.value }))}
            />
            {showErrors && !selectedItem?.detalle && (
                <div className="text-red-500 text-xs mt-1">El detalle es obligatorio</div>
            )}
            {duplicado && (
                <div className="text-red-500 text-xs mt-1">Ya existe una sanción con esa gravedad y detalle</div>
            )}
            <Select
                isRequired
                label="Estado"
                name="estado"
                selectedKeys={selectedItem?.estado !== undefined ? [selectedItem.estado.toString()] : []}
                onSelectionChange={(keys) => {
                    const selectedValue = Number(Array.from(keys)[0]);
                    setSelectedItem((prev) => ({
                        ...prev,
                        estado: selectedValue,
                    }));
                }}
                variant="bordered"
                className="focus:border-primario mt-4"
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

export default FormCrear;
