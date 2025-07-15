import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, Button, Pagination, Input, Dropdown, DropdownItem, DropdownTrigger, DropdownMenu, Chip, Spinner } from "@heroui/react";
import React, { useState, useCallback, useMemo } from "react";
import { SearchIcon } from "./icons/SearchIcon";
import { ChevronDownIcon } from "./icons/ChevronDownIcon";
import { PlusIcon } from "./icons/PlusIcon";

const TablaDinamica = ({ columns, data, acciones = [], setAccion = null, onOpen, onOpenChange, ocultarAgregar = false, mostrarAcciones = true, filterOptions = [], loading = false }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filterValue, setFilterValue] = useState("");
    const [selectedFilters, setSelectedFilters] = useState({});
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map((col) => col.uid)));
    const numElementos = 7;

    // Componente personalizado para el mensaje de tabla vacía
    const EmptyTableMessage = () => (
        <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
                <svg 
                    className="w-14 h-14 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                    />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No hay datos disponibles
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
                No se encontraron registros que coincidan con los criterios de búsqueda.
            </p>
        </div>
    );

    // Componente personalizado para el spinner de carga
    const LoadingTableMessage = () => (
        <div className="flex flex-col items-center justify-center py-16 px-6">
            <Spinner 
                size="lg" 
                color="primary" 
                label="Cargando datos..."
                labelColor="primary"
                className="mb-4"
            />
            <p className="text-sm text-gray-500 text-center">
                Por favor espere mientras se cargan los datos
            </p>
        </div>
    );

    
    const abrirDrawer = (accion = 0) => {
        if (setAccion !== null) {
            if (accion !== 0) {
                setAccion(accion);
            }
        }
        onOpen();
    };

    const estadosColors = {
        1: "danger",   // Inactivo
        2: "success",  // Activo
        "Inactivo": "danger",
        "Activo": "success"
    };

    const getEstadoLabel = (estado) => {
        const labels = {
            1: "Inactivo",
            2: "Activo"
        };
        return labels[estado] || estado;
    };

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const searchMatch = columns.some((column) =>
                String(item[column.uid] || "")
                    .toLowerCase()
                    .includes(filterValue.toLowerCase())
            );

            const filtersMatch = Object.entries(selectedFilters).every(([field, values]) => {
                if (!values || values.length === 0) return true;
                // Si el filtro es de estado, comparar por label
                if (field === "estado") {
                    const itemLabel = getEstadoLabel(item[field]);
                    return values.some((value) =>
                        String(itemLabel).toLowerCase() === String(value).toLowerCase()
                    );
                }
                return values.some((value) =>
                    String(item[field] || "").toLowerCase() === String(value).toLowerCase()
                );
            });

            return searchMatch && filtersMatch;
        });
    }, [filterValue, selectedFilters, data, columns]);

    const datosPaginados = useMemo(() => {
        const start = (currentPage - 1) * numElementos;
        const end = start + numElementos;
        return filteredData.slice(start, end);
    }, [filteredData, currentPage, numElementos]);

    const renderCell = useCallback((item, index, columnKey) => {
        let cellValue = item[columnKey];

        if (columnKey === "nombreCompleto") {
            cellValue = `${item.nombre || ""} ${item.apellidoUno || ""} ${item.apellidoDos || ""}`.trim();
        }

        switch (columnKey) {
            case "acciones":
                if (mostrarAcciones) {
                    return (
                        <div className="flex items-center justify-center">
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button isIconOnly variant="flat" className="bg-transparent">
                                        <span className="text-lg text-gray-600">⋮</span>
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Acciones">
                                    {acciones.map((accion, i) => (
                                        <DropdownItem
                                            key={i}
                                            onPress={() => accion.handler(item)}
                                            className="capitalize"
                                        >
                                            <div className="flex items-center gap-2">
                                                {accion.icon}
                                                <span>{accion.tooltip}</span>
                                            </div>
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    );
                } else {
                    const accion = acciones[0];
                    return (
                        <button
                            onClick={() => accion.handler(item)}
                            className="text-blue-500 hover:text-blue-700"
                        >
                            {accion.icon}
                        </button>
                    );
                }

            case "estado": {
                // Definir color de texto según el estado
                let textColor = "";
                if (cellValue === 2 || cellValue === "Activo") textColor = "text-green-700";
                else if (cellValue === 1 || cellValue === "Inactivo") textColor = "text-red-600";
                else if (cellValue === "Paused") textColor = "text-pink-600";
                else if (cellValue === "Vacation") textColor = "text-yellow-700";
                else textColor = "text-gray-700";

                return (
                    <Chip
                        className={`capitalize border-none gap-1 px-3 py-1 text-sm font-semibold bg-opacity-80 ${textColor}`}
                        color={estadosColors[cellValue]}
                        size="sm"
                        variant="flat"
                    >
                        {getEstadoLabel(cellValue)}
                    </Chip>
                );
            }

            default:
                return cellValue;
        }
    }, [acciones, mostrarAcciones, estadosColors]);

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Buscar..."
                        startContent={<SearchIcon className="text-gray-500" />}
                        value={filterValue}
                        onClear={() => setFilterValue("")}
                        onValueChange={(value) => setFilterValue(value)}
                    />
                    <div className="flex gap-3">

                        {filterOptions.map(({ field, label, values }) => (
                            <Dropdown key={field}>
                                <DropdownTrigger>
                                    <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                                        {label}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label={`Filtrar por ${label}`}
                                    closeOnSelect={false}
                                    selectionMode="multiple"
                                    selectedKeys={selectedFilters[field] || []}
                                    onSelectionChange={(keys) =>
                                        setSelectedFilters((prev) => ({
                                            ...prev,
                                            [field]: [...keys],
                                        }))
                                    }
                                >
                                    {values.map((value) => (
                                        <DropdownItem key={value} className="capitalize">
                                            {value}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>
                        ))}

                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                                    Columnas
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={visibleColumns}
                                selectionMode="multiple"
                                onSelectionChange={setVisibleColumns}
                            >
                                {columns.map((column) => (
                                    <DropdownItem key={column.uid} className="capitalize">
                                        {column.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                        {!ocultarAgregar && (
                            <Button className="bg-primario text-white" onPress={() => { abrirDrawer(2) }} endContent={<PlusIcon />}>
                                Agregar
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }, [filterValue, visibleColumns, columns, ocultarAgregar, abrirDrawer]);

    const bottomContent = useMemo(() => {
        return (
            <div className="flex w-full justify-center mt-6">
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={currentPage}
                    total={Math.max(1, Math.ceil(filteredData.length / numElementos))}
                    onChange={(page) => setCurrentPage(page)}
                    initialPage={1}
                />
            </div>
        );
    }, [filteredData, currentPage, numElementos]);

    return (
        <Table
            isHeaderSticky
            className="text-gray-800"
            isStriped
            topContent={topContent}
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={{
                wrapper: "max-h-[700px]",
                th: "bg-primario text-white",
            }}
            color="danger"
        >
            <TableHeader columns={columns.filter((col) => visibleColumns.has(col.uid))}>
                {(column) => (
                    <TableColumn key={column.uid} align="center">
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody emptyContent={loading ? <LoadingTableMessage /> : <EmptyTableMessage />}>
                {loading ? [] : datosPaginados.map((item, index) => (
                    <TableRow key={item.id || index} className="hover:bg-gray-200 hover:rounded-full transition duration-300">
                        {columns
                            .filter((col) => visibleColumns.has(col.uid))
                            .map((column) => (
                                <TableCell key={column.uid}>
                                    {renderCell(item, index, column.uid)}
                                </TableCell>
                            ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default TablaDinamica;