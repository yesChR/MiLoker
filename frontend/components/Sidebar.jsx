import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import React, { useState } from "react";
import { FaChalkboardTeacher } from "react-icons/fa";
import { GiLockers } from "react-icons/gi";
import { FaBookReader } from "react-icons/fa";
import { BsPersonFillExclamation, BsPersonFillGear } from "react-icons/bs";
import { BiSolidReport } from "react-icons/bi";
import { CollapsIcon, LogoutIcon } from "./icons";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "@heroui/react";

const menuItems = [
  {
    id: 1,
    label: "Administración",
    icon: BsPersonFillGear,
    subItems: [
      { label: "Administradores", link: "/administrador/docentes" },
      { label: "Docentes", link: "/administrador/administradores" },
      { label: "Estudiantes", link: "/administrador/docentes" },
      { label: "Especialidades", link: "/administrador/administradores" },
      { label: "Tipos de sanciones", link: "/administrador/docentes" },
      { label: "Periodos de solicitud", link: "/administrador/administradores" },
    ],
  },
  {
    id: 2,
    label: "Docente",
    icon: FaChalkboardTeacher,
    subItems: [
      { label: "Sub Opción A", link: "/docente/subA" },
      { label: "Sub Opción B", link: "/docente/subB" },
    ],
  },
  {
    id: 3,
    label: "Casillero",
    icon: GiLockers,
    subItems: [
      { label: "Sub Casillero 1", link: "/casillero/sub1" },
      { label: "Sub Casillero 2", link: "/casillero/sub2" },
    ],
  },
  {
    id: 4,
    label: "Estudiante",
    icon: FaBookReader,
    subItems: [
      { label: "Sub Estudiante 1", link: "/estudiante/sub1" },
      { label: "Sub Estudiante 2", link: "/estudiante/sub2" },
    ],
  },
  {
    id: 5,
    label: "Incidente",
    icon: BsPersonFillExclamation,
    subItems: [
      { label: "Sub Incidente 1", link: "/incidente/sub1" },
      { label: "Sub Incidente 2", link: "/incidente/sub2" },
    ],
  },
  {
    id: 6,
    label: "Informe",
    icon: BiSolidReport,
    link: "/informe",
  },
];

const Sidebar = () => {
  const [toggleCollapse, setToggleCollapse] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const router = useRouter();

  const handleExpand = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getNavItemClasses = (menu) => {
    const isActive =
      menu.subItems?.some((sub) => router.pathname.startsWith(sub.link)) ||
      (!menu.subItems && router.pathname.startsWith(menu.link));
    return classNames(
      "flex items-center cursor-pointer hover:bg-gray-200 rounded w-full overflow-hidden whitespace-nowrap m-1",
      {
        ["bg-gray-200"]: activeMenu?.id === menu.id,
      }
    );
  };

  return (
    <div
      className={classNames(
        "h-screen px-4 pt-8 pb-4 bg-white flex justify-between flex-col shadow-xl z-10",
        { "w-60": !toggleCollapse, "w-20": toggleCollapse }
      )}
      style={{ transition: "width 500ms cubic-bezier(0.2, 0, 0, 1) 0s" }}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between relative">
          <div className="flex items-center pl-1 gap-4">
            {toggleCollapse ? (
              <div
                onClick={() => setToggleCollapse(false)}
                className="flex-shrink-0 cursor-pointer flex items-center justify-center w-12 h-12 hover:bg-gray-100 rounded"
              >
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
            ) : (
              <div className="flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
            )}
            {!toggleCollapse && (
              <span className="mt-2 text-2xl text-azulOscuro font-bold">MiLoker</span>
            )}
          </div>
          {!toggleCollapse && (
            <div
              onClick={() => setToggleCollapse(true)}
              className="p-2 cursor-pointer rounded hover:bg-gray-100 flex items-center justify-center"
            >
              <FiChevronLeft className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>

        <div className="flex flex-col items-start mt-10">
          {menuItems.map(({ id, icon: Icon, subItems, link, ...menu }) => {
            return (
              <div key={id} className="w-full">
                <div
                  className={classNames(
                    getNavItemClasses({ subItems, link }),
                    "flex py-3 px-3 items-center justify-between"
                  )}
                  onClick={() => {
                    if (!subItems && link) {
                      router.push(link);
                    } else {
                      handleExpand(id);
                    }
                  }}
                >
                  <div className="flex items-center">
                    <div style={{ width: "2.5rem" }}>
                      <Icon className="w-6 h-6 text-gray-500" />
                    </div>
                    {!toggleCollapse && (
                      <span className="text-sm font-medium text-gray-700">
                        {menu.label}
                      </span>
                    )}
                  </div>
                </div>
                {!toggleCollapse && expandedItems[id] && subItems && (
                  <ul className="ml-12 list-disc text-gray-600">
                    {subItems.map((subItem, index) => (
                      <li
                        key={index}
                        className={classNames("text-sm", {
                          "text-blue-500 font-bold": router.pathname.startsWith(
                            subItem.link
                          ),
                        })}
                      >
                        <Link href={subItem.link}>{subItem.label}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={classNames(
          "flex items-center px-3 py-4 cursor-pointer hover:bg-gray-100 rounded",
          { "w-60": !toggleCollapse, "w-20": toggleCollapse }
        )}
      >
        <div style={{ width: "2.5rem" }}>
          <LogoutIcon className="w-6 h-6 text-danger" />
        </div>
        {!toggleCollapse && (
          <span className="text-sm font-medium text-danger">Cerrar sesión</span>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
