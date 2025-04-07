import CabezeraDinamica from "../Layout/CabeceraDinamica"
import { Input, Button, useDisclosure, DatePicker } from "@heroui/react"
import { SearchIcon } from "../icons/SearchIcon"
import { Divider } from "@heroui/react";
import { LuSendHorizontal } from "react-icons/lu";


const CrearUsuarios = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = Object.fromEntries(formData.entries())
        console.log(data)
    }

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Crear Usuarios"
                    breadcrumb="Inicio • Crear usuarios"
                />
            </div>
            <div className="mx-auto w-full max-w-4xl">
                <form onSubmit={handleSubmit} className="border-2 border-gray-200 rounded-lg p-4 bg-white w-md">
                    <div>
                        <h2 className="text-md font-semibold text-gray-600">Datos del estudiante:</h2>
                        <p className="text-sm text-muted-foreground text-danger">* Digite la cédula del estudiante para cargar los datos</p>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            <div className="relative">
                                <Input
                                    placeholder="Cédula"
                                    variant="bordered"
                                    color="primary"
                                    className="pr-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const cedulaInput = document.querySelector('input[name="cedula"]')
                                        if (cedulaInput && cedulaInput.value.trim() !== '') {
                                            console.log('Buscando cédula:', cedulaInput.value)

                                        }
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white transition-transform duration-200 hover:bg-primario hover:scale-105 w-[52px] h-[39.5px] bg-primario rounded-lg flex items-center justify-center"
                                >
                                    <SearchIcon />
                                </button>
                            </div>
                            <Input placeholder="Nombre" variant="bordered" color="primary" />
                            <Input placeholder="Primer Apellido" variant="bordered" color="primary" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            <Input placeholder="Segundo Apellido" variant="bordered" color="primary" />
                            <DatePicker placeholder="Fecha nacimiento" variant="bordered" color="primary" />
                            <Input placeholder="Teléfono" variant="bordered" color="primary" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            <Input placeholder="Correo" variant="bordered" color="primary" />
                            <Input placeholder="Sección" variant="bordered" color="primary" />
                        </div>
                        <Divider className="my-4" />
                    </div>
                    <div>
                        <h2 className="text-md font-semibold text-gray-600">Datos del primer encargado:</h2>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            <Input placeholder="Nombre" variant="bordered" color="primary" />
                            <Input placeholder="Primer Apellido" variant="bordered" color="primary" />
                            <Input placeholder="Segundo Apellido" variant="bordered" color="primary" />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            <Input placeholder="Parentesco" variant="bordered" color="primary" />
                            <Input placeholder="Correo" variant="bordered" color="primary" />
                            <Input placeholder="Teléfono" variant="bordered" color="primary" />
                        </div>
                        <Divider className="my-4" />
                    </div>
                    <div>
                        <h2 className="text-md font-semibold text-gray-600">Datos del segundo encargado (opcional):</h2>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            <Input name="encargado2_nombre" placeholder="Nombre" variant="bordered" color="primary" />
                            <Input name="encargado2_apellido1" placeholder="Primer Apellido" variant="bordered" color="primary" />
                            <Input name="encargado2_apellido2" placeholder="Segundo Apellido" variant="bordered" color="primary" />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            <Input name="encargado2_parentesco" placeholder="Parentesco" variant="bordered" color="primary" />
                            <Input name="encargado2_correo" placeholder="Correo" variant="bordered" color="primary" />
                            <Input name="encargado2_telefono" placeholder="Teléfono" variant="bordered" color="primary" />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" className="px-6 bg-primario text-white mt-2" endContent={<LuSendHorizontal /> }>Enviar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearUsuarios
