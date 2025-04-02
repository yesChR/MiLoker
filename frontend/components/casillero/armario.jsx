import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import { BiEditAlt, BiUnderline } from "react-icons/bi";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Drawer, Select } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { Input } from "@heroui/react";
import { Button } from "@heroui/react";
import { PlusIcon } from "../icons/PlusIcon";

const Armario = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const abrirDrawer = () => {
        onOpen();
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Casilleros"
                    breadcrumb="Inicio • Casilleros"
                />
            </div>
            <div className="flex flex-row items-center justify-between rounded-lg w-full max-w-xl mx-auto mt-6">
                <Select className="w-[200px] rounded-md" placeholder="Especialidad" />
                <Button className="bg-primario text-white flex items-center" onPress={() => abrirDrawer()} endContent={<PlusIcon />}>
                    Agregar
                </Button>
            </div>
            <div className="border border-gray-300 p-2 rounded-lg w-full max-w-xl mx-auto h-[420px] mt-6">
                <div className="bg-primary text-white p-4 text-lg rounded-md text-center font-bold">Armario #</div>
                <div className="grid grid-cols-3 gap-5 mt-5">
                    {Array.from({ length: 12 }, (_, index) => (
                        <button
                            key={index}
                            className="bg-celeste text-white w-full h-[65px] flex items-center justify-center text-lg rounded-md shadow-md transition-transform duration-200 hover:bg-celesteOscuro hover:scale-105"
                            onClick={() => console.log(`Seleccionaste el número ${index + 1}`)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
            <DrawerGeneral titulo={"Agregar Armario"} size={"xs"} isOpen={isOpen} onOpen={onOpen} onOpenChange={onOpenChange}>
                <Input
                    placeholder="ID"
                    variant={"bordered"}
                    className="focus:border-primario"
                    color="primary"
                />
                <Select
                    placeholder="Filas"
                    type="number"
                    variant={"bordered"}
                    className="focus:border-primario"
                    color="primary"
                />
                <Select
                    placeholder="Columnas"
                    type="number"
                    variant={"bordered"}
                    className="focus:border-primario"
                    color="primary"
                />
            </DrawerGeneral>
        </div>
    );
};

export default Armario;
