import { Avatar } from "@heroui/react";
import classNames from "classnames";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
export function UserButton() {
    return (
        <div className="absolute top-0 right-0 mr-2">
            <div className="flex py-4 px-3 items-center w-full h-full">
                <div style={{ width: "2.5rem" }}>
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Avatar
                                isBordered
                                as="button"
                                className="transition-transform"
                                size="sm"
                            />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Profile Actions" variant="flat">
                            <DropdownItem key="profile" className="h-14 gap-2">
                                <p className="font-semibold">Hola, @usuario</p>
                            </DropdownItem>
                            <DropdownItem key="settings">Cambiar contraseña</DropdownItem>
                            <DropdownItem key="logout" color="danger" className="text-danger">
                                Cerrar sesión
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
        </div>
    );
}