import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import { BiEditAlt } from "react-icons/bi";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Drawer, Select } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { Input } from "@heroui/react";

const Estudiante = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const columnasPrueba = [
        { name: "#", uid: "index" },
        { name: "Nombre", uid: "nombre" },
        { name: "Categoría", uid: "categoria" },
        { name: "Acciones", uid: "acciones" },
    ];

    const datosPrueba = [
        { id: 1, nombre: "Electrónica", categoria: "Tecnología" },
        { id: 2, nombre: "Ropa", categoria: "Moda" },
        { id: 3, nombre: "Hogar", categoria: "Decoración" },
    ];

    const accionesPrueba = [
        {
            tooltip: "Editar",
            icon: <BiEditAlt />,
            handler: (item) => console.log("Editar", item),
        },
        {
            tooltip: "Eliminar",
            icon: <DeleteIcon />,
            handler: (item) => console.log("Eliminar", item),
        },
    ];
    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Estudiantes"
                    breadcrumb="Inicio • Estudiantes"
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
                <DrawerGeneral titulo={"Agregar Estudiantes"} size={"xs"} isOpen={isOpen} onOpen={onOpen} onOpenChange={onOpenChange}>
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
}

export default Estudiante;