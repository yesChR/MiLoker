import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, Button, Pagination, Input, Dropdown, DropdownItem, DropdownTrigger, DropdownMenu } from "@heroui/react";
import React, { useState, useCallback, useMemo } from "react";
import { SearchIcon } from "./icons/SearchIcon";
import { ChevronDownIcon } from "./icons/ChevronDownIcon";
import { PlusIcon } from "./icons/PlusIcon";

const TablaDinamica = ({ columns, data, acciones = [] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filterValue, setFilterValue] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map((col) => col.uid)));
    const numElementos = 5;

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
                                    ⋮ {/* Icono de tres puntos verticales */}
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
                        placeholder="Search by name..."
                        startContent={<SearchIcon />}
                        value={filterValue}
                        onClear={() => setFilterValue("")}
                        onValueChange={(value) => setFilterValue(value)}
                    />
                    <div className="flex gap-3">
                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                                    Columns
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
                        <Button className="bg-primario text-white" endContent={<PlusIcon />}>
                            Add New
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
                    color="danger"
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
            className="custom-table"
            isStriped
            topContent={topContent}
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={{
                wrapper: "max-h-[382px]",
                th: "bg-primario text-white",
            }} /*  Ajustar luego si da problemas*/
            color="danger"

        >
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn key={column.uid} align="center">
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody>
                {datosPaginados.map((item, index) => (
                    <TableRow key={item.id || index} className="hover:bg-gray-200 transition duration-300">
                        {(columnKey) => <TableCell>{renderCell(item, index, columnKey)}</TableCell>}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default TablaDinamica;