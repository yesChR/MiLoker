import React from "react";
import { Input } from "@heroui/react";
import { Form } from "@heroui/react";

const FormCrear = ({ selectedItem, setSelectedItem }) => (
    <Form>
        <Input
            label="Cédula"
            placeholder="70123987"
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
            isRequired
            errorMessage="La cédula es obligatoria"
        />
        <Input
            label="Nombre"
            placeholder="Juan"
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
            placeholder="López"
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
            isRequired
            errorMessage="El segundo apellido es obligatorio"
        />
        <Input
            label="Correo"
            placeholder="juan@gmail.com"
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
            label="Teléfono (opcional)"
            placeholder="62345677"
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
    </Form>
);

export default FormCrear;