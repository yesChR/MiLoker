import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Form, Input, Button } from "@heroui/react";
import { cambiarContraseñaService } from "../../../services/authService";
import { Toast } from "../../CustomAlert";
import { EyeFilledIcon } from "../../icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../../icons/EyeSlashFilledIcon";
import { signOut } from "next-auth/react";

const CambiarContraseña = forwardRef(({ cedulaUsuario, onSuccess }, ref) => {
    const [formData, setFormData] = useState({
        contraseñaActual: "",
        nuevaContraseña: "",
        confirmarContraseña: ""
    });
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        actual: false,
        nueva: false,
        confirmar: false
    });
    const [errors, setErrors] = useState({});

    // Componente para el botón de mostrar/ocultar contraseña
    const PasswordToggle = ({ isVisible, toggleVisibility }) => (
        <button
            aria-label="toggle password visibility"
            className="focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 ease-in-out"
            type="button"
            onClick={toggleVisibility}
        >
            {isVisible ? (
                <EyeSlashFilledIcon className="text-lg md:text-xl text-gray-500 hover:text-primary transition-colors duration-200" />
            ) : (
                <EyeFilledIcon className="text-lg md:text-xl text-gray-500 hover:text-primary transition-colors duration-200" />
            )}
        </button>
    );

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar error específico cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.contraseñaActual.trim()) {
            newErrors.contraseñaActual = "La contraseña actual es requerida";
        }

        if (!formData.nuevaContraseña.trim()) {
            newErrors.nuevaContraseña = "La nueva contraseña es requerida";
        } else if (formData.nuevaContraseña.length < 6) {
            newErrors.nuevaContraseña = "La nueva contraseña debe tener al menos 6 caracteres";
        }

        if (!formData.confirmarContraseña.trim()) {
            newErrors.confirmarContraseña = "Debe confirmar la nueva contraseña";
        } else if (formData.nuevaContraseña !== formData.confirmarContraseña) {
            newErrors.confirmarContraseña = "Las contraseñas no coinciden";
        }

        if (formData.contraseñaActual === formData.nuevaContraseña && formData.contraseñaActual.trim()) {
            newErrors.nuevaContraseña = "La nueva contraseña debe ser diferente a la actual";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Exponer validateAndSubmit a través de la ref
    useImperativeHandle(ref, () => ({
        validateAndSubmit: async () => {
            if (!validateForm()) {
                return false;
            }

            try {
                const result = await cambiarContraseñaService(
                    formData.contraseñaActual,
                    formData.nuevaContraseña,
                    cedulaUsuario
                );

                if (result.error) {
                    Toast.error("Error", result.message || "Error al cambiar contraseña");
                    return false;
                } else {
                    Toast.success("Éxito", result.message || "Contraseña cambiada exitosamente");
                    setFormData({
                        contraseñaActual: "",
                        nuevaContraseña: "",
                        confirmarContraseña: ""
                    });
                    
                    try {
                        await signOut({ 
                            callbackUrl: '/auth/login',
                            redirect: true 
                        });
                    } catch (error) {
                        console.error('Error al cerrar sesión:', error);
                        window.location.href = '/auth/login';
                    }
                    
                    onSuccess && onSuccess();
                    return true;
                }
            } catch (error) {
                console.error("Error al cambiar contraseña:", error);
                Toast.error("Error", "Error inesperado al cambiar contraseña");
                return false;
            }
        }
    }), [formData, cedulaUsuario, onSuccess]);

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return (
        <Form
            className="w-full space-y-4"
            validationBehavior="native"
        >
            <Input
                label="Contraseña actual"
                type={showPasswords.actual ? "text" : "password"}
                value={formData.contraseñaActual}
                onValueChange={(value) => handleChange("contraseñaActual", value)}
                isRequired
                errorMessage={errors.contraseñaActual}
                isInvalid={!!errors.contraseñaActual}
                placeholder="Ingrese su contraseña actual"
                color="primary"
                variant="bordered"
                size="sm"
                radius="md"
                endContent={
                    <PasswordToggle 
                        isVisible={showPasswords.actual}
                        toggleVisibility={() => togglePasswordVisibility("actual")}
                    />
                }
            />

            <Input
                label="Nueva contraseña"
                type={showPasswords.nueva ? "text" : "password"}
                value={formData.nuevaContraseña}
                onValueChange={(value) => handleChange("nuevaContraseña", value)}
                isRequired
                errorMessage={errors.nuevaContraseña}
                isInvalid={!!errors.nuevaContraseña}
                placeholder="Ingrese su nueva contraseña (mínimo 6 caracteres)"
                color="primary"
                variant="bordered"
                size="sm"
                radius="md"
                endContent={
                    <PasswordToggle 
                        isVisible={showPasswords.nueva}
                        toggleVisibility={() => togglePasswordVisibility("nueva")}
                    />
                }
            />

            <Input
                label="Confirmar nueva contraseña"
                type={showPasswords.confirmar ? "text" : "password"}
                value={formData.confirmarContraseña}
                onValueChange={(value) => handleChange("confirmarContraseña", value)}
                isRequired
                errorMessage={errors.confirmarContraseña}
                isInvalid={!!errors.confirmarContraseña}
                placeholder="Confirme su nueva contraseña"
                color="primary"
                variant="bordered"
                size="sm"
                radius="md"
                endContent={
                    <PasswordToggle 
                        isVisible={showPasswords.confirmar}
                        toggleVisibility={() => togglePasswordVisibility("confirmar")}
                    />
                }
            />
        </Form>
    );
});

CambiarContraseña.displayName = 'CambiarContraseña';

export default CambiarContraseña;
