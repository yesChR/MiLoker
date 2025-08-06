import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { useRouter } from "next/router";
import { useCallback, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { ROLES } from "../common/roles";
import DrawerGeneral from "../DrawerGeneral";
import CambiarContraseña from "@/components/auth/cambioContraseña/CambiarContraseña";

export function UserButton() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const cambiarContraseñaRef = useRef();

    const getRoleStyles = (role) => {
        switch (role) {
            case ROLES.ADMINISTRADOR:
                return {
                    borderColor: 'border-danger-500',
                    textColor: 'text-danger',
                    bgColor: 'bg-danger-50',
                    label: 'Administrador'
                };
            case ROLES.PROFESOR:
                return {
                    borderColor: 'border-primary-400',
                    textColor: 'text-primary-600',
                    bgColor: 'bg-primary-50',
                    label: 'Docente'
                };
            case ROLES.ESTUDIANTE:
                return {
                    borderColor: 'border-success-400',
                    textColor: 'text-success-600',
                    bgColor: 'bg-success-50',
                    label: 'Estudiante'
                };
            default:
                return {
                    borderColor: 'border-default-400',
                    textColor: 'text-default-600',
                    bgColor: 'bg-default-50',
                    label: 'Usuario'
                };
        }
    };

    const handleLogout = useCallback(async () => {
        try {
            await signOut({ 
                callbackUrl: '/auth/login',
                redirect: true 
            });
        } catch (error) {
            console.error('Error durante el logout:', error);
            // Fallback: redirigir manualmente si hay error
            router.push('/auth/login');
        }
    }, [router]);

    const handleOpenChangePassword = () => {
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setIsLoading(false);
    };

    const handlePasswordChangeSuccess = () => {
        setIsDrawerOpen(false);
        setIsLoading(false);
    };

    // Mostrar loading o datos por defecto mientras carga la sesión
    if (status === "loading") {
        return (
            <div className="absolute top-0 right-0 mr-2">
                <div className="flex py-4 px-3 items-center w-full h-full">
                    <div style={{ width: "2.5rem" }}>
                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Si no hay sesión, no mostrar nada o mostrar botón de login
    if (!session) {
        return null;
    }

    const { name, email, role, id, idEspecialidad } = session.user;
    const roleStyles = getRoleStyles(role);

    return (
        <div className="absolute top-0 right-0 mr-2">
            <div className="flex py-4 px-3 items-center w-full h-full">
                <div style={{ width: "2.5rem" }}>
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <div className={`rounded-full p-0.5 cursor-pointer ${roleStyles.borderColor} border-2`}>
                                <img
                                    src="/usuario.png"
                                    alt="User Avatar"
                                    className="rounded-full"
                                    width={32}
                                    height={32}
                                />
                            </div>
                        </DropdownTrigger>

                        <DropdownMenu
                            aria-label="Profile Actions"
                            variant="flat"
                            className="w-64"
                        >
                            <DropdownItem key="profile" className="h-16 gap-3 opacity-100" textValue="profile">
                                <div className="flex items-center gap-3 py-2">
                                    <div className={`rounded-full p-0.5 ${roleStyles.borderColor} border-2`}>
                                        <img
                                            src="/usuario.png"
                                            alt="User Avatar"
                                            className="rounded-full"
                                            width={32}
                                            height={32}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="font-semibold text-gray-800">
                                            {name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {email}
                                        </p>
                                        <div className={`text-xs font-medium ${roleStyles.textColor} mt-1`}>
                                            {roleStyles.label}
                                        </div>
                                    </div>
                                </div>
                            </DropdownItem>

                            <DropdownItem
                                key="divider2"
                                className="h-0 min-h-0 py-0 my-1 border-t border-gray-200 opacity-100 cursor-default pointer-events-none"
                                textValue="divider"
                            >
                            </DropdownItem>
                            <DropdownItem
                                key="settings"
                                className="py-2 hover:bg-gray-50"
                                onPress={handleOpenChangePassword}
                            >
                                <span className="text-gray-700">Cambiar contraseña</span>
                            </DropdownItem>
                            <DropdownItem
                                key="logout"
                                color="danger"
                                className="py-2 text-danger hover:bg-danger-50"
                                onPress={handleLogout}
                            >
                                <span className="font-medium">Cerrar sesión</span>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
            
            {/* Drawer para cambiar contraseña */}
            <DrawerGeneral
                isOpen={isDrawerOpen}
                onOpenChange={(open) => {
                    if (!isLoading && open === false) setIsDrawerOpen(open);
                }}
                titulo="Cambiar Contraseña"
                size="md"
                mostrarBotones={true}
                textoBotonPrimario="Cambiar Contraseña"
                textoBotonSecundario="Cancelar"
                onBotonPrimario={async () => {
                    if (isLoading) return;
                    setIsLoading(true);
                    const valid = await cambiarContraseñaRef.current?.validateAndSubmit?.();
                    if (!valid) {
                        setIsLoading(false);
                    }
                }}
                onBotonSecundario={() => {
                    if (!isLoading) {
                        handleCloseDrawer();
                    }
                }}
                loadingBotonPrimario={isLoading}
                loadingBotonSecundario={isLoading}
                disableClose={isLoading}
            >
                <CambiarContraseña
                    ref={cambiarContraseñaRef}
                    cedulaUsuario={id}
                    onSuccess={handlePasswordChangeSuccess}
                />
            </DrawerGeneral>
        </div>
    );
}