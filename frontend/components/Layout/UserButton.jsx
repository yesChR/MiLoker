import { Avatar } from "@heroui/react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { useRouter } from "next/router";
import { useCallback } from "react";

export function UserButton() {
    // Datos de ejemplo para el usuario
    const user = { name: "Usuario Ejemplo", email: "usuario@ejemplo.com" };

    return (
        <div className="absolute top-0 right-0 mr-2">
            <div className="flex py-4 px-3 items-center w-full h-full">
                <div style={{ width: "2.5rem" }}>
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <img
                                src="/usuario.png"
                                alt="User Avatar"
                                className="rounded-full cursor-pointer"
                                width={30}
                                height={30}
                            />
                        </DropdownTrigger>

                        <DropdownMenu
                            aria-label="Profile Actions"
                            variant="flat"
                            className="w-64"
                        >
                            <DropdownItem key="profile" className="h-16 gap-3 opacity-100" textValue="profile">
                                <div className="flex items-center gap-3 py-2">
                                    <img
                                        src="/usuario.png"
                                        alt="User Avatar"
                                        className="rounded-full border border-gray-200"
                                        width={32}
                                        height={32}
                                    />
                                    <div className="flex flex-col">
                                        <p className="font-semibold text-gray-800">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            </DropdownItem>

                            <DropdownItem
                                key="divider2"
                                className="h-0 min-h-0 py-0 my-1 border-t border-gray-200 opacity-100 cursor-default pointer-events-none"
                                textValue="divider"
                            >
                                {/* Completamente vacío */}
                            </DropdownItem>

                            <DropdownItem
                                key="settings"
                                className="py-3 hover:bg-gray-50"
                            >
                                <span className="text-gray-700">Cambiar contraseña</span>
                            </DropdownItem>
                            <DropdownItem
                                key="logout"
                                color="danger"
                                className="py-3 text-red-600 hover:bg-red-50"
                                // onPress={handdleLogout}
                            >
                                <span className="font-medium">Cerrar sesión</span>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
        </div>
    );
}