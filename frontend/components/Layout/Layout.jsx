import React from "react";
import Sidebar from "./Sidebar";
import { HeroUIProvider } from "@heroui/react";
import { UserButton } from "./UserButton";
import TablaDinamica from "../Tabla"
import { BiEditAlt } from "react-icons/bi";
import { DeleteIcon } from "../icons/DeleteIcon";

const Layout = ({ children }) => {
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
    <div className="h-screen flex flex-row justify-start">
      <Sidebar />
      <UserButton />
      <div className="bg-white flex-1 p-4 text-white">
        <div className="flex justify-between mb-4" style={{ marginTop: "50px" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
