import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import React, { useState } from "react";
import { FiChevronLeft, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { LogoutIcon } from "../icons";
import { menuItems } from "../../data/menuitems";

const Sidebar = () => {
  const [toggleCollapse, setToggleCollapse] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]); // Almacena los IDs de los elementos expandidos
  const router = useRouter();

  const handleExpand = (id) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ); // Agrega o elimina el ID del estado
  };

  const checkSubItemsActive = (subItems) => {
    return subItems.some((item) => {
      if (item.subItems) {
        // Recursivamente verifica los sub-subitems
        return checkSubItemsActive(item.subItems);
      }

      // Manejar rutas dinámicas
      if (item.link.includes("[estado]")) {
        const dynamicLink = item.link.replace("[estado]", router.query.estado || "");
        return router.asPath === dynamicLink;
      }

      // Verificar si la ruta actual coincide con el enlace del menú
      return router.asPath === item.link;
    });
  };

  const getNavItemClasses = (menu) => {
    const isActive =
      (menu.subItems && checkSubItemsActive(menu.subItems)) ||
      (!menu.subItems && router.pathname.startsWith(menu.link));
    return classNames(
      "flex items-center cursor-pointer hover:bg-gray-200 rounded w-full overflow-hidden whitespace-nowrap m-1",
      {
        "bg-gray-200": isActive,
      }
    );
  };

  const renderSubItems = (items, level = 1, parentId = "") => {
    return (
      <ul
        className={classNames(
          "ml-8 list-disc", // Agregar "list-disc" para mostrar los bullets
          {
            "text-gray-700": level === 2, // Sub-subitems
            "text-gray-600": level === 1, // Subitems principales
          }
        )}
      >
        {items.map((item, index) => {
          const itemId = `${parentId}-${index}`;
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <li key={index} className="py-1">
              {hasSubItems ? (
                <>
                  <div
                    className="flex items-center cursor-pointer justify-between"
                    onClick={() => handleExpand(itemId)}
                  >
                    <span
                      className={classNames(
                        "font-medium",
                        {
                          "text-sm": level === 1, // Subitems principales
                          "text-xs": level === 2, // Sub-subitems más pequeños
                        },
                        {
                          "text-primario font-bold": level === 1 && checkSubItemsActive(item.subItems), // Subitems seleccionados
                          "text-azulOscuro font-bold": level === 2 && checkSubItemsActive(item.subItems), // Sub-subitems seleccionados
                        }
                      )}
                    >
                      {item.label}
                    </span>
                    {expandedItems.includes(itemId) ? (
                      <FiChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  {expandedItems.includes(itemId) && renderSubItems(item.subItems, level + 1, itemId)}
                </>
              ) : (
                <Link
                  href={item.link}
                  className={classNames(
                    "block font-medium",
                    {
                      "text-sm": level === 1, // Subitems principales
                      "text-xs": level === 2, // Sub-subitems más pequeños
                    },
                    {
                      "text-primario font-bold": level === 1 && router.asPath === item.link, // Subitems seleccionados
                      "text-azulOscuro font-bold": level === 2 && router.asPath === item.link, // Sub-subitems seleccionados
                    }
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div
      className={classNames(
        "h-screen px-4 pt-8 pb-4 bg-white flex flex-col justify-between shadow-xl z-10",
        { "w-60": !toggleCollapse, "w-20": toggleCollapse }
      )}
      style={{ transition: "width 500ms cubic-bezier(0.2, 0, 1) 0s" }}
    >
      <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
        {/* Encabezado del Sidebar */}
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

        {/* Contenido del Sidebar */}
        <div className="flex flex-col items-start mt-10">
          {menuItems.map(({ id, icon: Icon, subItems, link, ...menu }) => {
            const hasSubItems = subItems && subItems.length > 0;

            return (
              <div key={id} className="w-full">
                <div
                  className={classNames(
                    getNavItemClasses({ subItems, link }),
                    "flex py-3 px-3 items-center justify-between"
                  )}
                  onClick={() => {
                    if (!hasSubItems && link) {
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
                  {!toggleCollapse && hasSubItems && (
                    expandedItems.includes(id) ? (
                      <FiChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 text-gray-500" />
                    )
                  )}
                </div>
                {!toggleCollapse && expandedItems.includes(id) && hasSubItems && (
                  renderSubItems(subItems, 1, id.toString())
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pie del Sidebar */}
      <div
        className={classNames(
          "flex items-center px-3 py-4 cursor-pointer hover:bg-gray-100 rounded",
          { "w-60": !toggleCollapse, "w-20": toggleCollapse }
        )}
        onClick={() => {
          console.log("Cerrar sesión");
        }}
      >
        <div style={{ width: "2.5rem" }}>
          <LogoutIcon className="w-6 h-6 text-red-500" />
        </div>
        {!toggleCollapse && (
          <span className="text-sm font-medium text-red-500">Cerrar sesión</span>
        )}
      </div>
    </div>
  );
};

export default Sidebar;