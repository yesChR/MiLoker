import React, { useState, useEffect } from "react";
import { Divider, Spinner, Select, SelectItem } from "@heroui/react";
import Carousel from "react-multi-carousel";
import Image from "next/image";
import { AiOutlinePlus } from "react-icons/ai";
import { useFormularioRevision } from "../../hooks/useFormularioRevision";
import { obtenerTextoEstado, ESTADOS_INCIDENTE } from "../../utils/incidenteConstants";

const FormularioRevision = ({ selectedItem, loading: loadingProp }) => {
    // Debug log para ver los datos que llegan
    console.log('FormularioRevision - selectedItem:', selectedItem);

    const {
        loading: loadingHook,
        detalles,
        solucion,
        setSolucion,
        estadoSeleccionado,
        setEstadoSeleccionado,
        observaciones,
        setObservaciones,
        actualizarEstado
    } = useFormularioRevision(selectedItem?.idIncidente);

    // Combinar loading del prop y del hook
    const loading = loadingProp || loadingHook;
    const [evidencias, setEvidencias] = useState(selectedItem?.evidencia || []); // Estado para las evidencias
    const [detalleEditable, setDetalleEditable] = useState(selectedItem?.detalle || ''); // Estado para el detalle editable

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
        if (detalles) {
            setDetalleEditable(detalles.detalle || ''); // Inicializa el detalle editable con el valor actual
            setEvidencias(detalles.evidencia || []); // Inicializa las evidencias
        }
    }, [detalles]);

    const handleAddImage = (event) => {
        const files = Array.from(event.target.files);
        const newEvidencias = files.map((file) => URL.createObjectURL(file)); // Crear URLs temporales para las imágenes
        setEvidencias((prev) => [...prev, ...newEvidencias]); // Agregar nuevas evidencias
    };

    // Debug logs
    useEffect(() => {
        console.log('Estado actual:', {
            loading,
            selectedItem,
            detalles,
            estadoSeleccionado
        });
    }, [loading, selectedItem, detalles, estadoSeleccionado]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    // Usar selectedItem como respaldo si detalles aún no está disponible
    const datosAMostrar = detalles || selectedItem;

    if (!datosAMostrar) {
        return <p className="text-center text-gray-600">No hay datos disponibles.</p>;
    }

    return (
        <div className="space-y-4 px-10 pb-10">
            <div className="grid grid-cols-2 gap-2 items-center">
                <div>
                    <h2 className="text-gray-700 font-bold text-sm mb-2">Demandante:</h2>
                    <div className="text-gray-600 text-sm">
                        <p>Nombre: {detalles.demandante?.nombre}</p>
                        <p>Sección: {detalles.demandante?.seccion}</p>
                        <p>Teléfono: {detalles.demandante?.telefono}</p>
                        <p>Correo: {detalles.demandante?.correo}</p>
                    </div>
                </div>
                <div>
                    <h2 className="text-gray-700 font-bold text-sm mb-2">Responsable:</h2>
                    <div className="text-gray-600 text-sm">
                        <p>Nombre: {detalles.responsable?.nombre}</p>
                        <p>Sección: {detalles.responsable?.seccion}</p>
                        <p>Teléfono: {detalles.responsable?.telefono}</p>
                        <p>Correo: {detalles.responsable?.correo}</p>
                    </div>
                </div>
            </div>
            <Divider className="my-4" />
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h2 className="text-gray-700 font-bold text-sm mb-2">Encargados:</h2>
                                        {datosAMostrar?.encargados?.map((encargado, index) => (
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
                            label="Estado del incidente"
                            labelPlacement="outside"
                            placeholder="Seleccione un estado..."
                            variant="bordered"
                            className="focus:border-primario"
                            color="primary"
                            selectedKeys={estadoSeleccionado ? [estadoSeleccionado.toString()] : []}
                            onChange={(e) => setEstadoSeleccionado(Number(e.target.value))}
                        >
                            {Object.entries(ESTADOS_INCIDENTE).map(([key, value]) => (
                                <SelectItem key={value} value={value}>
                                    {obtenerTextoEstado(value)}
                                </SelectItem>
                            ))}
                        </Select>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                            <textarea
                                className="w-full border rounded-lg p-2 text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                rows="2"
                                placeholder="Agregue observaciones sobre el cambio de estado..."
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Solución propuesta</label>
                            <textarea
                                className="w-full border rounded-lg p-2 text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                rows="4"
                                placeholder="Describa la solución planteada..."
                                value={solucion}
                                onChange={(e) => setSolucion(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={actualizarEstado}
                            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors"
                            disabled={loading}
                        >
                            {loading ? "Actualizando..." : "Actualizar estado"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormularioRevision;