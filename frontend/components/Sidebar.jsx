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
  { id: 1, label: "Administración", icon: BsPersonFillGear, link: "/administracion" },
  { id: 2, label: "Docente", icon: FaChalkboardTeacher, link: "/docente" },
  { id: 3, label: "Casillero", icon: GiLockers, link: "/casillero" },
  { id: 4, label: "Estudiante", icon: FaBookReader, link: "/estudiante" },
  { id: 5, label: "Incidente", icon: BsPersonFillExclamation, link: "/incidente" },
  { id: 6, label: "Informe", icon: BiSolidReport, link: "/informe" },
];

const Sidebar = () => {
  const [toggleCollapse, setToggleCollapse] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);

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
        ["bg-light-lighter"]: activeMenu.id === menu.id,
      }
    );
  };

  const onMouseOver = () => {
    setIsCollapsible(!isCollapsible);
  };

  const handleSidebarToggle = () => {
    setToggleCollapse(!toggleCollapse);
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
          {menuItems.map(({ icon: Icon, ...menu }) => {
            const classes = getNavItemClasses(menu);
            return (
              <div key={menu.id} className={classes}>
                <Link href={menu.link} className="flex py-4 px-3 items-center w-full h-full">
                  <div style={{ width: "2.5rem" }}>
                    <Icon className="w-6 h-6 text-gray"/>
                  </div>
                  {!toggleCollapse && (
                    <span
                      className={classNames(
                        "text-sm font-medium text-gray"
                      )}
                    >
                      {menu.label}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${getNavItemClasses({})} px-3 py-4`}>
        <div style={{ width: "2.5rem" }}>
        <LogoutIcon className="w-6 h-6 text-danger"/>
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
