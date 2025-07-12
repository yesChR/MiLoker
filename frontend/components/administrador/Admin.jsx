import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import { BiEditAlt } from "react-icons/bi";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Select, SelectItem, Chip } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { Input } from "@heroui/react";
import React, { useState, useEffect } from "react";
import { MdOutlinePassword } from "react-icons/md";
import { getAdministradores, createAdministrador, updateAdministrador, disableAdministrador } from "../../services/adminService";
import CustomAlert from "../CustomAlert";

const Admin = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null);
    const [accion, setAccion] = useState("");
    const [administradores, setAdministradores] = useState([]);
    const [loading, setLoading] = useState(true);
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

    // Funciones helper para mostrar estados y roles
    const getEstadoLabel = (estado) => {
        const labels = {
            [ESTADOS.INACTIVO]: "Inactivo",
            [ESTADOS.ACTIVO]: "Activo"
        };
        return labels[estado] || "Desconocido";
    };

    const getEstadoColor = (estado) => {
        const colors = {
            [ESTADOS.INACTIVO]: "danger",
            [ESTADOS.ACTIVO]: "success"
        };
        return colors[estado] || "default";
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
            setAlert({
                show: true,
                type: 'error',
                message: 'Error al cargar los administradores'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCrear = async () => {
        try {
            // Validar que existan datos
            if (!selectedItem) {
                setAlert({
                    show: true,
                    type: 'error',
                    message: 'Error: No hay datos en el formulario'
                });
                return;
            }
            
            // Validar campos requeridos
            if (!selectedItem?.cedula || !selectedItem?.nombre || !selectedItem?.apellidoUno || !selectedItem?.apellidoDos || !selectedItem?.correo) {
                setAlert({
                    show: true,
                    type: 'error',
                    message: 'Por favor complete todos los campos requeridos'
                });
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

            const result = await createAdministrador(adminData);
            
            setAlert({
                show: true,
                type: 'success',
                message: 'Administrador creado exitosamente'
            });
            loadAdministradores();
            onOpenChange();
            setSelectedItem(null);
        } catch (error) {
            console.error('Error al crear administrador:', error);
            setAlert({
                show: true,
                type: 'error',
                message: error.message || 'Error al crear el administrador'
            });
        }
    };

    const handleEditarSubmit = async () => {
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
            setAlert({
                show: true,
                type: 'success',
                message: 'Administrador editado exitosamente'
            });
            loadAdministradores();
            onOpenChange();
            setSelectedItem(null);
        } catch (error) {
            console.error('Error al editar administrador:', error);
            setAlert({
                show: true,
                type: 'error',
                message: error.message || 'Error al editar el administrador'
            });
        }
    };

    const columnasPrueba = [
        { name: "Cédula", uid: "cedula" },
        { name: "Nombre", uid: "nombre" },
        { name: "Primer Apellido", uid: "apellidoUno" },
        { name: "Segundo Apellido", uid: "apellidoDos" },
        { name: "Correo", uid: "correo" },
        { name: "Teléfono", uid: "telefono" },
        { name: "Estado", uid: "estado" },
        { name: "Acciones", uid: "acciones" },
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

    const filterOptions = [
        { field: "estado", label: "Estado", values: ["Activo", "Inactivo"] },
    ];

    const accionesPrueba = [
        {
            tooltip: "Editar",
            icon: <BiEditAlt />,
            handler: handleEditar,
        },
        {
            tooltip: <span className="text-danger">Restablecer contraseña</span>,
            icon: <MdOutlinePassword className="text-danger" />,
            handler: (item) => console.log("Eliminar", item),
        },
        {
            tooltip: <span className="text-danger">Deshabilitar</span>,
            icon: <DeleteIcon className="text-danger" />,
            handler: (item) => console.log("Eliminar", item),
        },
    ];

    // Limpiar formulario cuando se abre para crear
    useEffect(() => {
        if (isOpen && accion !== 1) {
            setSelectedItem({});
        }
    }, [isOpen, accion]);

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            {alert.show && (
                <CustomAlert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert({ show: false, type: '', message: '' })}
                />
            )}
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
                        data={administradores}
                        acciones={accionesPrueba}
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
                    onOpenChange={(open) => {
                        onOpenChange(open);
                    }}
                    textoBotonPrimario={accion === 1 ? "Editar" : "Agregar"}
                    onBotonPrimario={() => {
                        return accion === 1 ? handleEditarSubmit() : handleCrear();
                    }}
                    onBotonSecundario={() => {
                        console.log("🚪 Botón cerrar clickeado");
                    }}
                >   
                    {accion === 1 ? (
                        // Formulario de Edición
                        <>
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
                                isDisabled={accion === 1} // Solo deshabilitar al editar
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
                            />
                            <Input
                                placeholder="Correo"
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
                                placeholder="Teléfono"
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
                                placeholder="Estado"
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