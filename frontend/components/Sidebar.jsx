import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import React, { useState, useMemo } from "react";
import { FaChalkboardTeacher } from "react-icons/fa";
import { GiLockers } from "react-icons/gi";
import { FaBookReader } from "react-icons/fa";
import { BsPersonFillExclamation } from "react-icons/bs";
import { BsPersonFillGear } from "react-icons/bs";
import { BiSolidReport } from "react-icons/bi";
import { CollapsIcon, LogoutIcon } from "./icons";

const menuItems = [
  {
    id: 1,
    label: "Administración",
    icon: BsPersonFillGear,
    link: "/",
    subItems: [
      { label: "Docentes", link: "/administrador/docentes" },
      { label: "Administradores", link: "/administrador/docentes" },
    ],
  },
  {
    id: 2,
    label: "Docente",
    icon: FaChalkboardTeacher,
    link: "/docente",
    subItems: [
      { label: "Sub Opción A", link: "/docente" },
      { label: "Sub Opción B", link: "/docente" },
    ],
  },
  {
    id: 3,
    label: "Casillero",
    icon: GiLockers,
    link: "/casillero",
    subItems: [
      { label: "Sub Casillero 1", link: "/casillero" },
      { label: "Sub Casillero 2", link: "/casillero" },
    ],
  },
  {
    id: 4,
    label: "Estudiante",
    icon: FaBookReader,
    link: "/estudiante",
    subItems: [
      { label: "Sub Estudiante 1", link: "/estudiante" },
      { label: "Sub Estudiante 2", link: "/estudiante" },
    ],
  },
  {
    id: 5,
    label: "Incidente",
    icon: BsPersonFillExclamation,
    link: "/incidente",
    subItems: [
      { label: "Sub Incidente 1", link: "/incidente" },
      { label: "Sub Incidente 2", link: "/incidente" },
    ],
  },
  {
    id: 6,
    label: "Informe",
    icon: BiSolidReport,
    link: "/informe",
    subItems: [
      { label: "Sub Informe 1", link: "/informe/sub1" },
      { label: "Sub Informe 2", link: "/informe/sub2" },
    ],
  },
  {
    id: 7,
    label: "Docentes",
    icon: BsPersonFillGear,
    link: "/administrador/docentes",
    subItems: [
      { label: "Sub Docente 1", link: "/administrador/docentes" },
      { label: "Sub Docente 2", link: "/administrador/docentes" },
    ],
  },
];

const Sidebar = () => {
  const [toggleCollapse, setToggleCollapse] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null); // Estado para rastrear el menú activo

  const router = useRouter();

  const activeMenu = useMemo(
    () => menuItems.find((menu) => menu.link === router.pathname),
    [router.pathname]
  );

  const wrapperClasses = classNames(
    "h-screen px-4 pt-8 pb-4 bg-white flex justify-between flex-col shadow-xl z-10",
    {
      ["w-60"]: !toggleCollapse,
      ["w-20"]: toggleCollapse,
    }
  );

  const collapseIconClasses = classNames(
    "p-2 rounded bg-light-lighter absolute right-0",
    {
      "rotate-180": toggleCollapse,
    }
  );

  const getNavItemClasses = (menu) => {
    return classNames(
      "flex items-center cursor-pointer hover:bg-light-lighter rounded w-full overflow-hidden whitespace-nowrap m-1",
      {
        ["bg-light-lighter"]: activeMenu?.id === menu.id,
      }
    );
  };

  const onMouseOver = () => {
    setIsCollapsible(!isCollapsible);
  };

  const handleSidebarToggle = () => {
    setToggleCollapse(!toggleCollapse);
  };

  const handleMenuClick = (menuId) => {
    setActiveMenuId(activeMenuId === menuId ? null : menuId); // Alterna el menú activo
  };

  return (
    <div
      className={wrapperClasses}
      onMouseEnter={onMouseOver}
      onMouseLeave={onMouseOver}
      style={{ transition: "width 300ms cubic-bezier(0.2, 0, 0, 1) 0s" }}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between relative">
          <div className="flex items-center pl-1 gap-4">
            <Image src="/logo.png" alt="logo" width={40} height={40} />
            <span
              className={classNames("mt-2 text-2xl text-azulOscuro font-bold", {
                hidden: toggleCollapse,
              })}
            >
              MiLoker
            </span>
          </div>
          {isCollapsible && (
            <button
              className={collapseIconClasses}
              onClick={handleSidebarToggle}
            >
              <CollapsIcon />
            </button>
          )}
        </div>

        <div className="flex flex-col items-start mt-10">
          {menuItems.map(({ id, icon: Icon, subItems, ...menu }) => {
            const classes = getNavItemClasses(menu);
            return (
              <div key={id} className="w-full">
                <div
                  onClick={() => handleMenuClick(id)}
                  className={classNames(
                    classes,
                    "flex py-4 px-3 items-center cursor-pointer"
                  )}
                >
                  <div style={{ width: "2.5rem" }}>
                    <Icon className="w-6 h-6 text-gray-500" />
                  </div>
                  {!toggleCollapse && (
                    <span
                      className={classNames(
                        "text-sm font-medium text-gray-700"
                      )}
                    >
                      {menu.label}
                    </span>
                  )}
                </div>
                {!toggleCollapse && activeMenuId === id && subItems && (
                  <ul className="ml-8 list-disc text-gray-600">
                    {subItems.map((subItem, index) => (
                      <li key={index} className="text-sm">
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

      <div className={`${getNavItemClasses({})} px-3 py-4`}>
        <div style={{ width: "2.5rem" }}>
          <LogoutIcon className="w-6 h-6 text-danger" />
        </div>
        {!toggleCollapse && (
          <span className={classNames("text-sm font-medium text-danger")}>
            Cerrar sesión
          </span>
        )}
      </div>
    </div>
  );
};

export default Sidebar;