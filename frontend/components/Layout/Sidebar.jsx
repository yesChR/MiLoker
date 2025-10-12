import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { FiChevronLeft, FiChevronDown, FiChevronUp, FiChevronRight} from "react-icons/fi";
import { LogoutIcon } from "../icons";
import { menuItems } from "../../data/menuitems";
import { tieneAccesoRuta } from "../../config/routeConfig";
import { useSession } from "next-auth/react";

const Sidebar = ({ toggleCollapse, setToggleCollapse }) => {
  const [expandedItems, setExpandedItems] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
    }
  }, [status, session]);

  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(!window.matchMedia("(min-width: 768px)").matches);
      }
    };

    checkIsMobile();

    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia("(min-width: 768px)");
      mediaQuery.addListener(checkIsMobile);

      return () => {
        mediaQuery.removeListener(checkIsMobile);
      };
    }
  }, []);

  // Función recursiva para filtrar subItems
  const filterSubItems = useCallback((subItems, userRole) => {
    return subItems.filter(subItem => {
      // Si el subItem tiene un link directo, verificar acceso
      if (subItem.link) {
        return tieneAccesoRuta(userRole, subItem.link);
      }

      // Si el subItem tiene subItems anidados, filtrarlos recursivamente
      if (subItem.subItems) {
        const filteredNestedSubItems = filterSubItems(subItem.subItems, userRole);
        // Solo mostrar el subItem padre si tiene al menos un subitem accesible
        return filteredNestedSubItems.length > 0;
      }

      // Si no tiene link ni subItems, mostrar por defecto
      return true;
    }).map(subItem => {
      // Si tiene subItems anidados, aplicar el filtro recursivamente
      if (subItem.subItems) {
        return {
          ...subItem,
          subItems: filterSubItems(subItem.subItems, userRole)
        };
      }
      return subItem;
    });
  }, []);

  // Función para filtrar items del menú basado en el rol del usuario
  const filterMenuItems = useCallback((items, userRole) => {
    if (!userRole) return [];

    return items.filter(item => {
      // Si tiene un link directo, verificar acceso
      if (item.link) {
        return tieneAccesoRuta(userRole, item.link);
      }

      // Si tiene subItems, filtrarlos recursivamente
      if (item.subItems) {
        const filteredSubItems = filterSubItems(item.subItems, userRole);
        // Solo mostrar el item padre si tiene al menos un subitem accesible
        return filteredSubItems.length > 0;
      }

      // Si no tiene link ni subItems, mostrar por defecto
      return true;
    }).map(item => {
      // Si el item tiene subItems, aplicar el filtro
      if (item.subItems) {
        return {
          ...item,
          subItems: filterSubItems(item.subItems, userRole)
        };
      }
      return item;
    });
  }, [filterSubItems]);

  // Usar useMemo para optimizar el filtrado
  const filteredMenuItems = useMemo(() => {
    // Durante la carga, mostrar menú vacío en lugar de spinner
    if (status === "loading" || !session?.user?.role) {
      return [];
    }
    return filterMenuItems(menuItems, session.user.role);
  }, [session?.user?.role, status, filterMenuItems]);

  const handleExpand = (id) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const checkSubItemsActive = (subItems) => {
    return subItems.some((item) => {
      if (item.subItems) {
        return checkSubItemsActive(item.subItems);
      }

      if (item.link.includes("[estado]")) {
        const dynamicLink = item.link.replace("[estado]", router.query.estado || "");
        return router.asPath === dynamicLink;
      }

      return router.asPath === item.link;
    });
  };

  const getNavItemClasses = (menu) => {
    let isActive = false;
    
    if (menu.subItems) {
      isActive = checkSubItemsActive(menu.subItems);
    } else if (menu.link) {
      // Para la ruta raíz, hacer comparación exacta
      if (menu.link === "/") {
        isActive = router.pathname === "/";
      } else {
        // Para otras rutas, usar startsWith
        isActive = router.pathname.startsWith(menu.link);
      }
    }
    
    return classNames(
      "flex items-center cursor-pointer hover:bg-gray-200 rounded w-full overflow-hidden whitespace-nowrap mb-1",
      {
        "bg-gray-200": isActive,
      }
    );
  };

  const renderSubItems = (items, level = 1, parentId = "") => {
    return (
      <ul
        className={classNames(
          "ml-8 list-disc",
          {
            "text-gray-700": level === 2,
            "text-gray-600": level === 1,
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
                          "text-sm": level === 1,
                          "text-xs": level === 2,
                        },
                        {
                          "text-primario font-bold": level === 1 && checkSubItemsActive(item.subItems),
                          "text-azulOscuro font-bold": level === 2 && checkSubItemsActive(item.subItems),
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
                      "text-sm": level === 1,
                      "text-xs": level === 2,
                    },
                    {
                      "text-primario font-bold": level === 1 && router.asPath === item.link,
                      "text-azulOscuro font-bold": level === 2 && router.asPath === item.link,
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
        "h-screen px-4 pt-8 pb-4 bg-white flex flex-col justify-between shadow-xl z-50 transform transition-transform duration-300", // Animación para móviles
        {
          "w-60": !toggleCollapse, // Ancho completo cuando está expandido
          "w-20 md:w-20": toggleCollapse, // Colapsado en pantallas grandes
          "-translate-x-full md:translate-x-0": toggleCollapse && isMobile, // Oculto en móviles cuando está colapsado
          "fixed md:relative": true, // Drawer en móviles, relativo en pantallas grandes
        }
      )}
      style={{ transition: "width 500ms cubic-bezier(0.2, 0, 1) 0s" }}
    >
      <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
        {/* Encabezado del Sidebar */}
        <div className="flex items-center justify-between relative hidden md:flex">
          <div className="flex items-center pl-1 gap-4">
            {toggleCollapse ? (
              <div
                onClick={() => setToggleCollapse(false)}
                className="flex-shrink-0 cursor-pointer flex items-center justify-center w-12 h-12 hover:bg-gray-100 rounded"
              >
                <FiChevronRight className="w-6 h-6 text-gray-500" />
              </div>
            ) : (
              <div className="flex-shrink-0">
                <Image
                  src="/Logo.png"
                  alt="Logo"
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
          {/* Siempre mostrar los menús filtrados, sin spinner durante la carga */}
          {filteredMenuItems.map(({ id, icon: Icon, subItems, link, ...menu }) => {
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
        {/* Botón cerrar sesión */}
        <div
          className={classNames(
            "flex items-center px-3 py-3 cursor-pointer hover:bg-gray-300 rounded mt-auto",
            {
              "justify-center": toggleCollapse, // Centrar el contenido cuando está colapsado
              "justify-start": !toggleCollapse, // Alinear a la izquierda cuando está expandido
            }
          )}
          onClick={() => {
            console.log("Cerrar sesión");
          }}
        >
          <div style={{ width: "2.5rem" }} className="flex justify-center">
            <LogoutIcon className="w-4 h-6 text-red-500" />
          </div>
          {!toggleCollapse && (
            <span className="text-sm font-medium text-red-500">Cerrar sesión</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;