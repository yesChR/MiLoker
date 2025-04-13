import React, { useEffect, useState } from "react";
import { Divider, RadioGroup, Radio, Spinner } from "@heroui/react";
import Carousel from "react-multi-carousel";
import Image from "next/image";

const FormularioAlertaIncidente = ({ loading, selectedItem, prioridad, setPrioridad, tipoSancion, setDetalleEditable, detalleEditable}) => {

    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 1024 },
            items: 2,
        },
        desktop: {
            breakpoint: { max: 1024, min: 768 },
            items: 2,
        },
        tablet: {
            breakpoint: { max: 768, min: 464 },
            items: 1,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
        },
    };

    const CustomDot = ({ onClick, active }) => {
        return (
            <li
                className={`w-3 h-3 rounded-full mx-1 cursor-pointer ${
                    active ? "bg-blue-500" : "bg-gray-300"
                }`}
                onClick={onClick}
            ></li>
        );
    };

    useEffect(() => {
        if (selectedItem) {
            setDetalleEditable(selectedItem.detalle); // Inicializa el detalle editable con el valor actual
        }
    }, [selectedItem, setDetalleEditable]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    if (!selectedItem) {
        return <p>No hay datos seleccionados.</p>;
    }

    return (
        <div className="space-y-4 px-10 pb-10">
            <div className="grid grid-cols-2 gap-2 items-center">
                <div>
                    <h2 className="text-gray-700 font-bold text-sm mb-2">Demandante:</h2>
                    <div className="text-gray-600 text-sm">
                        <p>Nombre: {selectedItem.demandante.nombre}</p>
                        <p>Sección: {selectedItem.demandante.seccion}</p>
                        <p>Teléfono: {selectedItem.demandante.telefono}</p>
                        <p>Correo: {selectedItem.demandante.correo}</p>
                    </div>
                </div>
                <div>
                    <h2 className="text-gray-700 font-bold text-sm mb-2">Responsable:</h2>
                    <div className="text-gray-600 text-sm">
                        <p>Nombre: {selectedItem.responsable.nombre}</p>
                        <p>Sección: {selectedItem.responsable.seccion}</p>
                        <p>Teléfono: {selectedItem.responsable.telefono}</p>
                        <p>Correo: {selectedItem.responsable.correo}</p>
                    </div>
                </div>
            </div>
            <Divider className="my-4" />
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h2 className="text-gray-700 font-bold text-sm mb-2">Encargados:</h2>
                    {selectedItem.encargados.map((encargado, index) => (
                        <div key={index} className="mb-2 text-gray-600 text-sm">
                            <p className="font-semibold">
                                {encargado.parentesco}: {encargado.nombre}
                            </p>
                            <p>Teléfono: {encargado.telefono}</p>
                        </div>
                    ))}
                </div>
                <div>
                    <h2 className="text-gray-700 font-bold text-sm mb-2">Descripción del suceso:</h2>
                    <div className="text-gray-600 text-sm">
                        <textarea
                            className="w-full border rounded-lg p-2 text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            rows="4"
                            value={detalleEditable}
                            onChange={(e) => setDetalleEditable(e.target.value)}
                            placeholder="Escribe la descripción del suceso..."
                        ></textarea>
                    </div>
                </div>
            </div>
            <Divider className="my-4" />
            <div className="w-full">
                <h2 className="text-gray-700 font-bold text-sm mb-2">Evidencia:</h2>
                {selectedItem.evidencia && selectedItem.evidencia.length > 0 ? (
                    <Carousel
                        responsive={responsive}
                        showDots={true}
                        swipeable={true}
                        customDot={<CustomDot />}
                        dotListClass="custom-dot-list-style"
                        containerClass="pb-8"
                    >
                        {selectedItem.evidencia.map((src, index) => (
                            <div key={index} className="p-2">
                                <Image
                                    width={400}
                                    lazyBoundary="200px"
                                    height={400}
                                    src={src}
                                    alt={`Evidencia ${index + 1}`}
                                    className="w-full h-96 object-cover rounded-lg border shadow-md"
                                />
                            </div>
                        ))}
                    </Carousel>
                ) : (
                    <p className="text-gray-500 text-sm">No hay evidencias disponibles.</p>
                )}
            </div>
            <Divider className="my-4" />
            <div className="w-full gap-2">
                <h2 className="text-gray-700 font-bold text-sm mb-2 text-center">
                    Seleccione el tipo sanción:
                </h2>
                <div className="flex justify-center items-center mt-6">
                    <RadioGroup
                        value={prioridad}
                        onValueChange={(value) => {
                            setPrioridad(value);
                        }}
                        color="primary"
                        size="md"
                        orientation="horizontal"
                    >
                        {tipoSancion.map((sancion) => (
                            <Radio
                                key={sancion.id}
                                value={sancion.nombre}
                                description={sancion.descripcion}
                            >
                                {sancion.nombre}
                            </Radio>
                        ))}
                    </RadioGroup>
                </div>
            </div>
        </div>
    );
};

export default FormularioAlertaIncidente;