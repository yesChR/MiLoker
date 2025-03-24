import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, Button, Pagination, Input, Dropdown, DropdownItem, DropdownTrigger, DropdownMenu } from "@heroui/react";
import React, { useState, useCallback, useMemo } from "react";
import { SearchIcon } from "./icons/SearchIcon";
import { ChevronDownIcon } from "./icons/ChevronDownIcon";
import { PlusIcon } from "./icons/PlusIcon";

const TablaDinamica = ({ columns, data, acciones = [], onOpen, onOpenChange}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filterValue, setFilterValue] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map((col) => col.uid)));
    const numElementos = 5;

    const abrirDrawer = () => {
        onOpen();
    };

    const hasSearchFilter = Boolean(filterValue);

    const filteredData = useMemo(() => {
        if (!filterValue) return data;

        return data.filter((item) =>
            columns.some((column) =>
                String(item[column.uid] || "")
                    .toLowerCase()
                    .includes(filterValue.toLowerCase())
            )
        );
    }, [filterValue, data, columns]);

    // Paginación de los datos
    const datosPaginados = useMemo(() => {
        const start = (currentPage - 1) * numElementos;
        const end = start + numElementos;
        return filteredData.slice(start, end);
    }, [filteredData, currentPage, numElementos]);

    const renderCell = useCallback((item, index, columnKey) => {
        const cellValue = item[columnKey];
        const globalIndex = (currentPage - 1) * numElementos + index + 1;

        if (columnKey === "index") {
            return <h1>{globalIndex}</h1>;
        } else if (columnKey === "acciones") {
            return (
                <div className="flex items-center justify-center">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                isIconOnly
                                variant="flat"
                                className="bg-transparent"
                            >
                                <span className="text-lg text-gray-600">
                                    ⋮ 
                                </span>
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
        }
        return cellValue;
    }, [currentPage, numElementos, acciones]);

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Buscar..."
                        startContent={<SearchIcon className="text-gray-500"/>}
                        value={filterValue}
                        onClear={() => setFilterValue("")}
                        onValueChange={(value) => setFilterValue(value)}
                    />
                    <div className="flex gap-3">
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
                        <Button className="bg-primario text-white" onPress={()=> abrirDrawer()} endContent={<PlusIcon />}>
                            Agregar
                        </Button>
                    </div>
                </div>
            </div>
        );
    }, [filterValue, visibleColumns, columns]);

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
                wrapper: "max-h-[382px]",
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
            <TableBody>
                {datosPaginados.map((item, index) => (
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
    )
};
export default TablaDinamica;