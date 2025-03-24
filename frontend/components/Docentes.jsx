import CabezeraDinamica from "./CabezeraDinamica";
import TablaDinamica from "./Tabla";
import { BiEditAlt } from "react-icons/bi";
import { DeleteIcon } from "./icons/DeleteIcon";

const Docentes = () => {
    const columnasPrueba = [
        { name: "#", uid: "index" },
        { name: "Nombre", uid: "nombre" },
        { name: "Categoría", uid: "categoria" },
        { name: "Acciones", uid: "acciones" },
    ];

    const datosPrueba = [
        { id: 1, nombre: "Electrónica", categoria: "Tecnología" },
        { id: 2, nombre: "Ropa", categoria: "Moda" },
        { id: 3, nombre: "Hogar", categoria: "Decoración" },
    ];

    const accionesPrueba = [
        {
            tooltip: "Editar",
            icon: <BiEditAlt />,
            handler: (item) => console.log("Editar", item),
        },
        {
            tooltip: "Eliminar",
            icon: <DeleteIcon />,
            handler: (item) => console.log("Eliminar", item),
        },
    ];
    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Docentes"
                    breadcrumb="Inicio • Docentes"
                />
            </div>
            <div className="w-full max-w-5xl"> {/* Ajustar aquii ancho de la tabla */}
                <div className="flex justify-between mb-4" style={{ marginTop: "50px" }}>
                    <TablaDinamica
                        columns={columnasPrueba}
                        data={datosPrueba}
                        acciones={accionesPrueba}
                    />
                </div>
            </div>
        </div>
    );
}

export default Docentes;