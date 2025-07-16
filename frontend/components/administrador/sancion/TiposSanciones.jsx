import CabezeraDinamica from "../../Layout/CabeceraDinamica";
import TablaDinamica from "../../Tabla";
import { BiEditAlt } from "react-icons/bi";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../../DrawerGeneral";
import FormCrear from "./FormCrear";
import FormEditar from "./FormEditar";
import React, { useState, useEffect, useRef } from "react";
import * as sancionService from "../../../services/sancionService";
import Toast from "../../CustomAlert";
import { Chip } from "@heroui/react";

const TiposSanciones = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null);
    const [accion, setAccion] = useState("");
    const [sanciones, setSanciones] = useState([]);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const formCrearRef = useRef();
    const formEditarRef = useRef();

    const columnas = [
        { name: "#", uid: "numero" },
        { name: "Gravedad", uid: "gravedad" },
        { name: "Detalle", uid: "detalle" },
        { name: "Estado", uid: "estado" },
        { name: "Acciones", uid: "acciones" },
    ];
    // Renderizar el estado con Chip usando el componente Chip de @heroui/react
    const renderEstado = (estado) => {
        const color = estado === 1 ? "success" : "danger";
        const label = estado === 1 ? "Activo" : "Inactivo";
        return <Chip color={color} variant="flat" size="sm">{label}</Chip>;
    };

    // Render personalizado para TablaDinamica
    const renderCell = (item, columnKey) => {
        if (columnKey === "estado") {
            return renderEstado(item.estado);
        }
        return item[columnKey];
    };

    useEffect(() => {
        fetchSanciones();
    }, []);

    const fetchSanciones = async () => {
        try {
            const data = await sancionService.getSanciones();
            setSanciones(data.map((s, idx) => ({
                ...s,
                numero: idx + 1,
            })));
        } catch (error) {
            console.error("Error al obtener sanciones", error);
        }
    };

    const handleEditar = (item) => {
        setAccion(1);
        setSelectedItem({
            id: item.idSancion || item.id,
            gravedad: item.gravedad,
            detalle: item.detalle,
            estado: item.estado !== undefined ? item.estado : 1
        });
        onOpen();
    };

    const filterOptions = [
        { field: "estado", label: "Estado", values: ["Activo", "Inactivo"] },
    ]

    const acciones = [
        {
            tooltip: "Editar",
            icon: <BiEditAlt />,
            handler: handleEditar,
        }
    ];

    // Crear sanción
    const handleCrearSancion = async () => {
        setDrawerLoading(true);
        try {
            await sancionService.createSancion({
                gravedad: selectedItem.gravedad,
                detalle: selectedItem.detalle,
                estado: 1
            });
            Toast.success("Sanción creada exitosamente");
            onOpenChange();
            setSelectedItem(null);
            setAccion("");
            await fetchSanciones();
        } catch (error) {
            Toast.error("Error al crear sanción");
            console.error("Error al crear sanción:", error);
        } finally {
            setDrawerLoading(false);
        }
    };

    // Editar sanción
    const handleEditarSancion = async () => {
        setDrawerLoading(true);
        try {
            await sancionService.updateSancion(selectedItem.id, {
                gravedad: selectedItem.gravedad,
                detalle: selectedItem.detalle,
                estado: selectedItem.estado
            });
            Toast.success("Sanción editada exitosamente");
            onOpenChange();
            setSelectedItem(null);
            setAccion("");
            await fetchSanciones();
        } catch (error) {
            Toast.error("Error al editar sanción");
            console.error("Error al editar sanción:", error);
        } finally {
            setDrawerLoading(false);
        }
    };

    // Limpiar selectedItem al abrir para crear
    const handleAbrirCrear = () => {
        setAccion(0);
        setSelectedItem({ gravedad: "", detalle: "" });
        onOpen();
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Sanciones"
                    breadcrumb="Inicio • Sanciones"
                />
            </div>
            <div className="w-full max-w-4xl">
                <div className="flex justify-between mb-4" style={{ marginTop: "50px" }}>
                    <TablaDinamica
                        columns={columnas}
                        data={sanciones}
                        acciones={acciones}
                        filterOptions={filterOptions}
                        onOpen={handleAbrirCrear}
                        setAccion={setAccion}
                        renderCell={renderCell}
                    />
                </div>
                <DrawerGeneral
                    titulo={accion === 1 ? "Editar Sanción" : "Agregar Sanción"}
                    size={"sm"}
                    isOpen={isOpen}
                    onOpenChange={(open) => {
                        if (!drawerLoading && open === false) onOpenChange(open);
                    }}
                    textoBotonPrimario={accion === 1 ? "Editar" : "Agregar"}
                    onBotonPrimario={async () => {
                        if (drawerLoading) return;
                        if (accion === 1) {
                            const valid = await formEditarRef.current?.validateAndSubmit?.();
                            if (valid) await handleEditarSancion();
                        } else {
                            const valid = await formCrearRef.current?.validateAndSubmit?.();
                            if (valid) await handleCrearSancion();
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
                            sanciones={sanciones}
                        />
                    ) : (
                        <FormCrear
                            ref={formCrearRef}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            sanciones={sanciones}
                        />
                    )}
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default TiposSanciones;