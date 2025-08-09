import CabezeraDinamica from "../../Layout/CabeceraDinamica";
import TablaDinamica from "../../Tabla";
import { BiEditAlt } from "react-icons/bi";
import { useDisclosure, Spinner } from "@heroui/react";
import DrawerGeneral from "../../DrawerGeneral";
import ConfirmModal from "../../ConfirmModal";
import FormCrear from "./FormCrear";
import FormEditar from "./FormEditar";
import React, { useState, useEffect, useRef } from "react";
import { Toast } from "../../CustomAlert";
import { MdOutlinePassword } from "react-icons/md";
import { getAdministradores, createAdministrador, updateAdministrador } from "../../../services/adminService";
import { restablecerContraseñaService } from "../../../services/authService";
import { ESTADOS } from "../../common/estados";
import { ROLES } from "../../common/roles";

const Admin = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null);
    const [accion, setAccion] = useState("");
    const [administradores, setAdministradores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const [itemToReset, setItemToReset] = useState(null);
    const [resetLoading, setResetLoading] = useState(false);
    const formCrearRef = useRef();
    const formEditarRef = useRef();

    // Cargar administradores al montar el componente
    useEffect(() => {
        loadAdministradores();
    }, []);

    const loadAdministradores = async () => {
        setLoading(true);
        try {
            const data = await getAdministradores();
            if (data && data.error) {
                setAdministradores([]);
                Toast.error('Error', data.message || 'Error al cargar los datos iniciales');
            } else if (Array.isArray(data)) {
                const administradoresProcessed = data.map(admin => ({
                    ...admin,
                    estadoTexto: admin.estado === ESTADOS.ACTIVO ? 'Activo' : 'Inactivo'
                }));
                setAdministradores(administradoresProcessed);
            } else {
                setAdministradores([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCrear = async () => {
        // Usar la referencia del formulario para validar y obtener datos
        if (!formCrearRef.current?.validateAndSubmit()) {
            return; // Si la validación falla, no continuar
        }
    };

    const handleFormCrearSubmit = async (formData) => {
        setDrawerLoading(true);
        const adminData = {
            cedula: formData.cedula,
            nombre: formData.nombre,
            apellidoUno: formData.apellidoUno,
            apellidoDos: formData.apellidoDos,
            correo: formData.correo,
            telefono: formData.telefono,
            estado: ESTADOS.ACTIVO,
            rol: ROLES.ADMINISTRADOR
        };
        const result = await createAdministrador(adminData);
        if (result && result.error) {
            if (result.message && result.message.includes('ya existe')) {
                Toast.error('Administrador ya existe', result.message);
            } else {
                Toast.error('Error', result.message || 'Error al crear el administrador');
            }
        } else {
            await loadAdministradores();
            setSelectedItem(null);
            Toast.success("Administrador creado", "El administrador fue creado exitosamente.");
            onOpenChange();
        }
        setDrawerLoading(false);
    };

    const handleEditarSubmit = async () => {
        // Usar la referencia del formulario para validar y obtener datos
        if (!formEditarRef.current?.validateAndSubmit()) {
            return; // Si la validación falla, no continuar
        }
    };

    const handleFormEditarSubmit = async (formData) => {
        setDrawerLoading(true);
        const adminData = {
            nombre: formData.nombre,
            apellidoUno: formData.apellidoUno,
            apellidoDos: formData.apellidoDos,
            correo: formData.correo,
            telefono: formData.telefono,
            estado: formData.estado
        };
        const result = await updateAdministrador(formData.cedula, adminData);
        if (result && result.error) {
            Toast.error('Error', result.message || 'Error al editar el administrador');
        } else {
            Toast.success("Administrador editado", "El administrador fue editado exitosamente.");
            await loadAdministradores();
            setSelectedItem(null);
            onOpenChange();
        }
        setDrawerLoading(false);
    };

    const columnas = [
        { name: "Cédula", uid: "cedula" },
        { name: "Nombre", uid: "nombreCompleto" },
        { name: "Correo", uid: "correo" },
        { name: "Teléfono", uid: "telefono" },
        { name: "Estado", uid: "estadoTexto" },
        { name: "Acciones", uid: "acciones" },
    ];

    // Definir filterOptions para evitar ReferenceError
    const filterOptions = [
        { field: "estadoTexto", label: "Estado", values: ["Activo", "Inactivo"] },
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

    const handleRestablecerContraseña = async (item) => {
        setItemToReset(item);
        onConfirmOpen();
    };

    const confirmarRestablecimiento = async () => {
        if (!itemToReset) return;

        setResetLoading(true);
        try {
            const result = await restablecerContraseñaService(itemToReset.cedula);
            
            if (result && result.error) {
                Toast.error('Error', result.message || 'Error al restablecer contraseña');
            } else {
                Toast.success(
                    "¡Contraseña restablecida!", 
                    `Nueva contraseña enviada a: ${result.data?.correoEnviado || itemToReset.correo}`
                );
                onConfirmClose();
            }
        } catch (error) {
            console.error('Error al restablecer contraseña:', error);
            Toast.error('Error', 'Error al restablecer contraseña');
        } finally {
            setResetLoading(false);
            setItemToReset(null);
        }
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
            handler: handleRestablecerContraseña,
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
                        <FormEditar
                            ref={formEditarRef}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            onSubmit={handleFormEditarSubmit}
                        />
                    ) : (
                        <FormCrear
                            ref={formCrearRef}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            onSubmit={handleFormCrearSubmit}
                        />
                    )}
                </DrawerGeneral>

                <ConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={onConfirmClose}
                    title="Restablecer contraseña"
                    confirmText="Restablecer"
                    cancelText="Cancelar"
                    confirmColor="warning"
                    onConfirm={confirmarRestablecimiento}
                    size="md"
                    customContent={itemToReset && (
                        <div className="space-y-2">
                            <div className="text-center">
                                <p className="text-gray-700 mb-2">
                                    ¿Está seguro de restablecer la contraseña?
                                </p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-blue-600 font-bold text-xl">
                                        {itemToReset.nombre?.charAt(0)}{itemToReset.apellidoUno?.charAt(0)}
                                    </span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-800">
                                    {itemToReset.nombre} {itemToReset.apellidoUno}
                                </h4>
                                <p className="text-sm text-gray-600">{itemToReset.correo}</p>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-gray-500">
                                    Se enviará una nueva contraseña temporal por correo electrónico
                                </p>
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

export default Admin;