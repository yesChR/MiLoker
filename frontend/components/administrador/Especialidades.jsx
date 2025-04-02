import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import { BiEditAlt, BiUnderline } from "react-icons/bi";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Drawer, Select } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { Input } from "@heroui/react";

const Especialidades = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const columnasPrueba = [
        { name: "#", uid: "numero" },
        { name: "Nombre", uid: "nombre" },
        { name: "Estado", uid: "estado" },
        { name: "Acciones", uid: "acciones" },
    ];

    const datosPrueba = [
        {
            id: 1,
            numero: 1,
            nombre: "Autenticación",
            estado: "Activo",
        },
        {
            id: 2,
            numero: 2,
            nombre: "Carga de datos",
            estado: "Inactivo",
        },
        {
            id: 3,
            numero: 3,
            nombre: "Interfaz de usuario",
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
                    title="Especialidades"
                    breadcrumb="Inicio • Especialidades"
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
                <DrawerGeneral titulo={"Agregar Especialidad"} size={"xs"} isOpen={isOpen} onOpen={onOpen} onOpenChange={onOpenChange}>
                    <Input
                        placeholder="Nombre"
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
                    <Select
                        placeholder="Estado"
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default Especialidades;