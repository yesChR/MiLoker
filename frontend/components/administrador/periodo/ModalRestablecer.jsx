import { Button } from "@heroui/react";
import CustomAlert from "../../CustomAlert";

const ModalRestablecer = ({ showAlert, onConfirm, onCancel }) => {
    if (!showAlert) return null;

    return (
        <div className="fixed top-10 right-4 z-50">
            <CustomAlert
                color="danger"
                variant="bordered"
                aria-labelledby="alert-title"
                size="sm"
                className="max-w-md"
                title="Precaución"
                description="¿Estás seguro de que deseas restablecer el período de solicitud? Esta acción no se puede deshacer."
            >
                <div className="flex items-center gap-2 mt-3">
                    <Button
                        className="bg-transparent text-danger"
                        size="sm"
                        onPress={onConfirm}
                    >
                        Confirmar
                    </Button>
                    <Button
                        className="bg-transparent text-black"
                        size="sm"
                        onPress={onCancel}
                    >
                        Cancelar
                    </Button>
                </div>
            </CustomAlert>
        </div>
    );
};

export default ModalRestablecer;
