import CabezeraDinamica from "../../Layout/CabeceraDinamica";
import TablaDinamica from "../../Tabla";
import { BiEditAlt } from "react-icons/bi";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../../DrawerGeneral";
import FormCrear from "./FormCrear";
import FormEditar from "./FormEditar";
import React, { useState, useEffect } from "react";
import { Toast } from "../../CustomAlert";
import { MdOutlinePassword } from "react-icons/md";
import { getAdministradores, createAdministrador, updateAdministrador } from "../../../services/adminService";
import { ESTADOS } from "../../common/estados";
import { ROLES } from "../../common/roles";

const Admin = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null);
    const [accion, setAccion] = useState("");
    const [administradores, setAdministradores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drawerLoading, setDrawerLoading] = useState(false);

    // Cargar administradores al montar el componente
    useEffect(() => {
        loadAdministradores();
    }, []);

    const loadAdministradores = async () => {
        try {
            setLoading(true);
            const data = await getAdministradores();
            setAdministradores(data);
        } catch (error) {
            console.error('Error al cargar administradores:', error);
            Toast.error('Error', 'Error al cargar los datos iniciales');
        } finally {
            setLoading(false);
        }
    };

    const handleCrear = async () => {
        setDrawerLoading(true);
        try {
            const adminData = {
                cedula: selectedItem?.cedula,
                nombre: selectedItem?.nombre,
                apellidoUno: selectedItem?.apellidoUno,
                apellidoDos: selectedItem?.apellidoDos,
                correo: selectedItem?.correo,
                telefono: selectedItem?.telefono,
                estado: ESTADOS.ACTIVO,
                rol: ROLES.ADMINISTRADOR
            };
            await createAdministrador(adminData);
            await loadAdministradores();
            setSelectedItem(null);
            Toast.success("Administrador creado", "El administrador fue creado exitosamente.");
            onOpenChange();
        } catch (error) {
            console.error('Error al crear administrador:', error);
            Toast.error('Error al crear el administrador');
        } finally {
            setDrawerLoading(false);
        }
    };

    const handleEditarSubmit = async () => {
        setDrawerLoading(true);
        try {
            const adminData = {
                nombre: selectedItem?.nombre,
                apellidoUno: selectedItem?.apellidoUno,
                apellidoDos: selectedItem?.apellidoDos,
                correo: selectedItem?.correo,
                telefono: selectedItem?.telefono,
                estado: selectedItem?.estado
            };
            await updateAdministrador(selectedItem.cedula, adminData);
            Toast.success("Administrador editado", "El administrador fue editado exitosamente.");
            await loadAdministradores();
            setSelectedItem(null);
            onOpenChange();
        } catch (error) {
            console.error('Error al editar administrador:', error);
            Toast.error('Error', error.message || 'Error al editar el administrador');
        } finally {
            setDrawerLoading(false);
        }
    };

    const columnas = [
        { name: "Cédula", uid: "cedula" },
        { name: "Nombre", uid: "nombre" },
        { name: "Primer Apellido", uid: "apellidoUno" },
        { name: "Segundo Apellido", uid: "apellidoDos" },
        { name: "Correo", uid: "correo" },
        { name: "Teléfono", uid: "telefono" },
        { name: "Estado", uid: "estado" },
        { name: "Acciones", uid: "acciones" },
    ];

    // Definir filterOptions para evitar ReferenceError
    const filterOptions = [
        { field: "estado", label: "Estado", values: ["Activo", "Inactivo"] },
    ];

    const handleEditar = (item) => {
        setAccion(1);
        setSelectedItem(null);
        onOpen();

        setTimeout(() => {
            const data = {
                cedula: item.cedula,
                nombre: item.nombre,
                apellidoUno: item.apellidoUno,
                apellidoDos: item.apellidoDos,
                correo: item.correo,
                telefono: item.telefono,
                estado: item.estado,
            };
            setSelectedItem(data);
        }, 500);
    };


    const acciones = [
        {
            tooltip: "Editar",
            icon: <BiEditAlt />,
            handler: handleEditar,
        },
        {
            tooltip: <span className="text-danger">Restablecer contraseña</span>,
            icon: <MdOutlinePassword className="text-danger" />,
            handler: (item) => console.log("Restablecer contraseña", item),
        }
    ];

    // Limpiar formulario cuando se abre para crear
    useEffect(() => {
        if (isOpen && accion !== 1) {
            setSelectedItem({});
        }
    }, [isOpen, accion]);

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
                        columns={columnas}
                        data={administradores}
                        acciones={acciones}
                        filterOptions={filterOptions}
                        onOpen={onOpen}
                        setAccion={setAccion}
                        loading={loading}
                    />
                </div>
                <DrawerGeneral
                    titulo={accion === 1 ? "Editar Administrador" : "Agregar Administrador"}
                    size={"sm"}
                    isOpen={isOpen}
                    // Evita que el Drawer se cierre por onOpenChange mientras está cargando
                    onOpenChange={(open) => {
                        if (!drawerLoading && open === false) onOpenChange(open);
                    }}
                    textoBotonPrimario={accion === 1 ? "Editar" : "Agregar"}
                    onBotonPrimario={async () => {
                        if (!drawerLoading) {
                            return accion === 1 ? handleEditarSubmit() : handleCrear();
                        }
                    }}
                    onBotonSecundario={async () => {
                        if (!drawerLoading) {
                            onOpenChange(false);
                        }
                    }}
                    loadingBotonPrimario={drawerLoading}
                    loadingBotonSecundario={drawerLoading}
                    disableClose={drawerLoading}
                >
                    {accion === 1 ? (
                        <FormEditar selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
                    ) : (
                        <FormCrear selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
                    )}
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default Admin;