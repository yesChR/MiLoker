import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    Button,
    useDisclosure,
    Input,
    Checkbox,
    Link,
} from "@heroui/react";

const DrawerGeneral = ({ children, titulo, isOpen, onOpen, onOpenChange, size }) => {

    return (
        <>
            <Drawer isOpen={isOpen} onOpenChange={onOpenChange} size={size}>
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="flex flex-col gap-1 text-azulOscuro">{titulo}</DrawerHeader>
                            <DrawerBody>
                                {children}
                            </DrawerBody>
                            <DrawerFooter>
                                <Button color="danger" variant="flat" onPress={onClose}>
                                    Cerrar
                                </Button>
                                <Button color="primary" onPress={onClose}>
                                    Crear
                                </Button>
                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default DrawerGeneral;

