import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Input, Form, Select, SelectItem, Chip } from "@heroui/react";
import { ESTADOS } from "../../common/estados";

const FormCrear = forwardRef(({ selectedItem, setSelectedItem, sanciones }, ref) => {
    const [showErrors, setShowErrors] = useState(false);
    const [duplicado, setDuplicado] = useState(false);


    const validateAndSubmit = () => {
        setShowErrors(true);
        setDuplicado(false);
        if (
            !selectedItem?.gravedad?.trim() ||
            !selectedItem?.detalle?.trim()
        ) {
            return false;
        }
        // Validar duplicado (ignorando el propio id)
        const existe = sanciones?.some(s =>
            s.gravedad.trim().toLowerCase() === selectedItem.gravedad.trim().toLowerCase() &&
            s.detalle.trim().toLowerCase() === selectedItem.detalle.trim().toLowerCase() &&
            (s.idSancion || s.id) !== selectedItem.id
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
                    placeholder="Almacenamiento de comida"
                    className={`border-2 rounded-2xl p-2 pt-7 w-full h-32 resize-y placeholder:text-sm text-sm text-gray-600 focus:border-blue-500 focus:outline-none peer border-gray-300`}
                    value={selectedItem ? selectedItem.detalle : ""}
                    onChange={e => setSelectedItem(prev => ({ ...prev, detalle: e.target.value }))}
                    required
                />
                <label className={`absolute left-3 top-2 text-base pointer-events-none transition-all duration-200
                    text-xs top-2
                    ${showErrors && !selectedItem?.detalle?.trim() ? 'text-danger' : 'text-blue-600'}
                    `}
                >Detalle<span className={`${showErrors && !selectedItem?.detalle?.trim() ? 'text-danger' : 'text-danger'}`}>*</span></label>
                {showErrors && !selectedItem?.detalle?.trim() && (
                    <div className="text-danger text-xs mt-1">El detalle es obligatorio</div>
                )}
            </div>

        </Form>
    );
});

export default FormCrear;
