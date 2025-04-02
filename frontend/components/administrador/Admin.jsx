import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import { BiEditAlt } from "react-icons/bi";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Drawer, Select } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { Input } from "@heroui/react";

const Admin = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const columnasPrueba = [
        { name: "Cédula", uid: "cedula" },
        { name: "Nombre", uid: "nombre" },
        { name: "Primer Apellido", uid: "primerApellido" },
        { name: "Segundo Apellido", uid: "segundoApellido" },
        { name: "Correo", uid: "correo" },
        { name: "Teléfono", uid: "telefono" },
        { name: "Estado", uid: "estado" },
        { name: "Acciones", uid: "acciones" },
    ];

    const datosPrueba = [
        {
            id: 1,
            cedula: "123456789",
            nombre: "Juan",
            primerApellido: "Pérez",
            segundoApellido: "Gómez",
            correo: "juan.perez@example.com",
            telefono: "88808888",
            estado: "Activo",
        },
        {
            id: 2,
            cedula: "987654321",
            nombre: "María",
            primerApellido: "Rodríguez",
            segundoApellido: "López",
            correo: "maria.rodriguez@example.com",
            telefono: "11112777",
            estado: "Inactivo",
        },
        {
            id: 3,
            cedula: "456789123",
            nombre: "Carlos",
            primerApellido: "Jiménez",
            segundoApellido: "Martínez",
            correo: "carlos.jimenez@example.com",
            telefono: "55556666",
            estado: "Activo",
        },
    ];

    const accionesPrueba = [
        {
            tooltip: "Editar",
            icon: <BiEditAlt />,
            handler: (item) => console.log("Editar", item),
        },
        {
            tooltip: <span className="text-danger">Eliminar</span>, // Aplica el color al texto del tooltip
            icon: <DeleteIcon className="text-danger" />,
            handler: (item) => console.log("Eliminar", item),
        },
    ];

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Administradores"
                    breadcrumb="Inicio • Administradores"
                />
            </div>
            <div className="w-full max-w-4xl">
                <div className="flex justify-between mb-4" style={{ marginTop: "50px" }}>
                    <TablaDinamica
                        columns={columnasPrueba}
                        data={datosPrueba}
                        acciones={accionesPrueba}
                        onOpen={onOpen}
                    />
                </div>
                <DrawerGeneral titulo={"Agregar Administradores"} size={"xs"} isOpen={isOpen} onOpen={onOpen} onOpenChange={onOpenChange}>
                    <Input
                        placeholder="Cédula"
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
                    <Input
                        placeholder="Nombre"
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
                    <Input
                        placeholder="Primer apellido"
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
                    <Input
                        placeholder="Segundo apellido"
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
                    <Input
                        placeholder="Correo"
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
                    <Input
                        placeholder="Teléfono"
                        variant={"bordered"}
                        type={"tel"}
                        pattern="^(?:\+506\s?)?[26-9]\d{3}-?\d{4}$"
                        className="focus:border-primario"
                        color="primary"
                    />
                    <Select
                        placeholder="Especialidad"
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default Admin;