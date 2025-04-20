import React, { useEffect, useState } from "react";
import { Divider, Spinner, Select, } from "@heroui/react"; // Importar Button, Select y Option
import Carousel from "react-multi-carousel";
import Image from "next/image";
import { AiOutlinePlus } from "react-icons/ai"; // Importar el ícono de "Agregar"

const FormularioRevision = ({ loading, selectedItem, setDetalleEditable, detalleEditable }) => {
    const [evidencias, setEvidencias] = useState(selectedItem?.evidencia || []); // Estado para las evidencias

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
                className={`w-3 h-3 rounded-full mx-1 cursor-pointer ${active ? "bg-blue-500" : "bg-gray-300"
                    }`}
                onClick={onClick}
            ></li>
        );
    };

    useEffect(() => {
        if (selectedItem) {
            setDetalleEditable(selectedItem.detalle); // Inicializa el detalle editable con el valor actual
            setEvidencias(selectedItem.evidencia || []); // Inicializa las evidencias
        }
    }, [selectedItem, setDetalleEditable]);

    const handleAddImage = (event) => {
        const files = Array.from(event.target.files);
        const newEvidencias = files.map((file) => URL.createObjectURL(file)); // Crear URLs temporales para las imágenes
        setEvidencias((prev) => [...prev, ...newEvidencias]); // Agregar nuevas evidencias
    };

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
                {evidencias && evidencias.length > 0 ? (
                    <Carousel
                        responsive={responsive}
                        showDots={true}
                        swipeable={true}
                        customDot={<CustomDot />}
                        dotListClass="custom-dot-list-style"
                        containerClass="pb-8"
                    >
                        {evidencias.map((src, index) => (
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
                        <div className="p-2">
                            <div className="p-2 flex items-center justify-center border-2 border-dashed border-blue-300 rounded-lg shadow-md h-96">
                                <label className="flex flex-col items-center space-y-4 cursor-pointer">
                                    <AiOutlinePlus className="text-blue-400 w-16 h-16" />
                                    <span className="text-blue-400 text-lg font-semibold">Agregar</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleAddImage}
                                    />
                                </label>
                            </div>
                        </div>
                    </Carousel>
                ) : (
                    <p className="text-gray-500 text-sm">No hay evidencias disponibles.</p>
                )}
            </div>
            <Divider className="my-4" />
            <div className="w-full gap-2">
                <div className="w-full">
                    <h2 className="text-gray-700 font-bold text-sm mb-2">Complete la información</h2>
                    <div className="space-y-4">
                        <Select
                            labelPlacement="outside"
                            placeholder="Seleccione un estado..."
                            variant={"bordered"}
                            className="focus:border-primario"
                            color="primary"
                        />

                        <textarea
                            className="w-full border rounded-lg p-2 text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            rows="4"
                            placeholder="Solución planteada..."
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormularioRevision;