import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import { BiEditAlt } from "react-icons/bi";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Select, SelectItem, Chip } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { Input } from "@heroui/react";
import React, { useState, useEffect } from "react";
import { Toast } from "../CustomAlert";
import { MdOutlinePassword } from "react-icons/md";
import { getAdministradores, createAdministrador, updateAdministrador, disableAdministrador } from "../../services/adminService";
import ConfirmModal from "../ConfirmModal";

const Admin = () => {
    // Estado para modal de confirmación de deshabilitar
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [adminToDisable, setAdminToDisable] = useState(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null);
    const [accion, setAccion] = useState("");
    const [administradores, setAdministradores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    // Constantes para estados y roles
    const ESTADOS = {
        INACTIVO: 1,
        ACTIVO: 2
    };

    const ROLES = {
        ADMINISTRADOR: 1,
        PROFESOR: 2,
        ESTUDIANTE: 3
    };

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
            // Validar que existan datos
            if (!selectedItem) {
                Toast.error('Error', 'No hay datos en el formulario');
                setDrawerLoading(false);
                return;
            }
            // Validar campos requeridos
            if (!selectedItem?.cedula || !selectedItem?.nombre || !selectedItem?.apellidoUno || !selectedItem?.apellidoDos || !selectedItem?.correo) {
                Toast.error('Error', 'Por favor complete todos los campos requeridos');
                setDrawerLoading(false);
                return;
            }
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
            Toast.error('Error', error.message || 'Error al crear el administrador');
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
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setAdminToDisable(null);
                }}
                title="¿Deshabilitar administrador?"
                description={`¿Estás seguro que deseas deshabilitar al administrador ${adminToDisable?.nombre || ''} ${adminToDisable?.apellidoUno || ''}?`}
                confirmText="Inhabilitar"
                cancelText="Cancelar"
                confirmColor="danger"
                onConfirm={async () => {
                    try {
                        await disableAdministrador(adminToDisable.cedula);
                        Toast.success("Administrador deshabilitado", "El administrador fue deshabilitado exitosamente.");
                        loadAdministradores();
                    } catch (error) {
                        Toast.error('Error', error.message || 'Error al deshabilitar el administrador');
                    }
                }}
                size="sm"
                showIcon={true}
                centered={true}
            />
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
                    size={"xs"}
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
                            // Si DrawerGeneral cierra con este callback
                            onOpenChange(false);
                        }
                    }}
                    loadingBotonPrimario={drawerLoading}
                    loadingBotonSecundario={drawerLoading}
                    disableClose={drawerLoading}
                >
                    {accion === 1 ? (
                        // Formulario de Edición
                        <>
                            {/* ...existing code... */}
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
                                isDisabled={accion === 1}
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
                            >
                                <SelectItem key={ESTADOS.ACTIVO} value={ESTADOS.ACTIVO}>
                                    <div className="flex items-center gap-2">
                                        <Chip color="success" variant="flat" size="sm">
                                            Activo
                                        </Chip>
                                    </div>
                                </SelectItem>
                                <SelectItem key={ESTADOS.INACTIVO} value={ESTADOS.INACTIVO}>
                                    <div className="flex items-center gap-2">
                                        <Chip color="danger" variant="flat" size="sm">
                                            Inactivo
                                        </Chip>
                                    </div>
                                </SelectItem>
                            </Select>
                        </>
                    ) : (
                        // Formulario de Creación
                        <>
                            {/* ...existing code... */}
                            <Input
                                placeholder="Cédula"
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
                            />
                            <Input
                                placeholder="Nombre"
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
                            />
                            <Input
                                placeholder="Primer apellido"
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
                            />
                            <Input
                                placeholder="Segundo apellido"
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
                            />
                            <Input
                                placeholder="Correo electrónico"
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
                            />
                            <Input
                                placeholder="Teléfono (opcional)"
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
                        </>
                    )}
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default Admin;