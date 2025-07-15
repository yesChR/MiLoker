import React from "react";
import { Input } from "@heroui/react";
import { Select, SelectItem, Chip } from "@heroui/react";
import { ESTADOS } from "../../common/estados";
import { Form } from "@heroui/react";


const FormEditar = ({ selectedItem, setSelectedItem }) => (
    <Form autoComplete="off">
        <Input
            label="Cédula"
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
            isDisabled
        />
        <Input
            label="Nombre"
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
            isRequired
            errorMessage="El nombre es obligatorio"
        />
        <Input
            label="Primer apellido"
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
            isRequired
            errorMessage="El primer apellido es obligatorio"
        />
        <Input
            label="Segundo apellido"
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
            isRequired
            errorMessage="El segundo apellido es obligatorio"
        />
        <Input
            label="Correo"
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
            type="email"
            isRequired
            errorMessage="El correo es obligatorio"
        />
        <Input
            label="Teléfono"
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
            isRequired
            errorMessage="El teléfono es obligatorio"
        />
        <Select
            label="Estado"
            selectedKeys={selectedItem?.estado ? [selectedItem.estado.toString()] : []}
            onSelectionChange={(keys) => {
                const selectedValue = Array.from(keys)[0];
                setSelectedItem((prev) => ({
                    ...prev,
                    estado: parseInt(selectedValue),
                }));
            }}
            variant={"bordered"}
            className="focus:border-primario"
            color="primary"
            isRequired
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

export default FormEditar;