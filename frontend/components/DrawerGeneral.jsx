import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    Button,
} from "@heroui/react";

const DrawerGeneral = ({
    children,
    titulo,
    isOpen,
    onOpenChange,
    size,
    mostrarBotones = true,
    textoBotonPrimario = "Crear", // Texto del botón primario
    textoBotonSecundario = "Cerrar", // Texto del botón secundario
    onBotonPrimario = () => {}, // Función del botón primario
    onBotonSecundario = () => {}, // Función del botón secundario
}) => {
    return (
        <>
            <Drawer isOpen={isOpen} onOpenChange={onOpenChange} size={size}>
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="flex flex-col gap-1 text-azulOscuro">
                                {titulo}
                            </DrawerHeader>
                            <DrawerBody>{children}</DrawerBody>
                            {mostrarBotones && ( // Mostrar los botones solo si mostrarBotones es true
                                <DrawerFooter>
                                    <Button
                                        color="danger"
                                        variant="flat"
                                        onPress={() => {
                                            onBotonSecundario();
                                            onClose();
                                        }}
                                    >
                                        {textoBotonSecundario}
                                    </Button>
                                    <Button
                                        color="primary"
                                        onPress={() => {
                                            onBotonPrimario();
                                            onClose();
                                        }}
                                    >
                                        {textoBotonPrimario}
                                    </Button>
                                </DrawerFooter>
                            )}
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default DrawerGeneral;

