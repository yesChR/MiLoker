import React from "react";
import { Select, SelectItem, Button, Divider, Form } from "@heroui/react";
import { LuSendHorizontal } from "react-icons/lu";
import { ESTADOS_SOLICITUD } from "../../common/estadosSolicutudes";

const FormularioRevision = ({ 
    selectedItem, 
    setSelectedItem, 
    procesando, 
    obtenerOpcionesCasilleros, 
    manejarEnvio, 
    estado 
}) => {

    if (estado !== ESTADOS_SOLICITUD.EN_ESPERA) {
        return null;
    }

    return (
        <div className="flex flex-col mb-4">
            <Form 
                validationBehavior="native"
                onSubmit={(e) => {
                    e.preventDefault();
                    manejarEnvio();
                }}
            >
                <Select
                    name="opcionCasillero"
                    label="Opción de Casillero"
                    labelPlacement="inside"
                    placeholder="Elegir opción"
                    size="sm"
                    radius="md"
                    onSelectionChange={(value) => {
                        setSelectedItem((prev) => ({
                            ...prev,
                            opcion: value.currentKey === 'ninguna' ? 'ninguna' : parseInt(value.currentKey),
                        }));
                    }}
                    variant={"bordered"}
                    className="focus:border-primario mb-4"
                    color="primary"
                    isDisabled={procesando}
                    isRequired
                    errorMessage="Por favor selecciona una opción"
                >
                    {obtenerOpcionesCasilleros().map((opcion) => (
                        <SelectItem key={opcion.id} value={opcion.id}>
                            {opcion.nombre}
                        </SelectItem>
                    ))}
                </Select>

                {selectedItem?.opcion === 'ninguna' && (
                    <textarea
                        name="razonRechazo"
                        className="w-full border rounded-lg p-2 text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                        rows="4"
                        placeholder="Escribe la razón del rechazo..."
                        value={selectedItem?.razonRechazo || ''}
                        onChange={(e) =>
                            setSelectedItem((prev) => ({
                                ...prev,
                                razonRechazo: e.target.value,
                            }))
                        }
                        disabled={procesando}
                        required
                    ></textarea>
                )}

                <div className="flex justify-end">
                    <Button 
                        type="submit"
                        color="primary" 
                        endContent={<LuSendHorizontal />}
                        isLoading={procesando}
                        isDisabled={procesando}
                    >
                        {procesando ? 'Procesando...' : 'Enviar'}
                    </Button>
                </div>
            </Form>
            <Divider className="mt-4" />
        </div>
    );
};

export default FormularioRevision;
