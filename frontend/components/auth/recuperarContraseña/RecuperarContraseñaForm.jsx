import React, { useState, useEffect } from "react";
import { Link, Divider } from "@heroui/react";
import { useRouter } from "next/router";
import {
    solicitarRecuperacionService,
    verificarCodigoRecuperacionService,
    cambiarContraseñaRecuperacionService
} from "../../../services/authService";
import { Toast } from "../../CustomAlert";
import Step1Email from "./steps/Step1Email";
import Step2Code from "./steps/Step2Code";
import Step3Password from "./steps/Step3Password";

const RecuperarContraseñaForm = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState("");
    const [verificationToken, setVerificationToken] = useState("");

    // Timer para el código
    const [timeLeft, setTimeLeft] = useState(0);

    // Estados del formulario
    const [formData, setFormData] = useState({
        email: "",
        codigo: "",
        nuevaContraseña: "",
        confirmarContraseña: ""
    });

    const [errors, setErrors] = useState({});
    const [showPasswords, setShowPasswords] = useState({
        nueva: false,
        confirmar: false
    });

    // Timer countdown
    useEffect(() => {
        let interval;
        if (timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timeLeft]);

    // Formatear tiempo
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar error específico
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // PASO 1: Solicitar recuperación
    const handleSolicitarRecuperacion = async (e) => {
        e.preventDefault();

        if (!formData.email.trim()) {
            setErrors({ email: "El correo electrónico es requerido" });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setErrors({ email: "Ingrese un correo electrónico válido" });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const result = await solicitarRecuperacionService(formData.email);

            if (result.error) {
                Toast.error("Error", result.message);
            } else {
                setToken(result.token);
                setCurrentStep(2);
                setTimeLeft(15 * 60); // 15 minutos
                Toast.success("Éxito", "Código de verificación enviado a tu correo");
            }
        } catch (error) {
            Toast.error("Error", "Error inesperado al solicitar recuperación");
        } finally {
            setLoading(false);
        }
    };

    // PASO 2: Verificar código
    const handleVerificarCodigo = async (e) => {
        e.preventDefault();

        if (!formData.codigo.trim()) {
            setErrors({ codigo: "El código es requerido" });
            return;
        }

        if (formData.codigo.length !== 6) {
            setErrors({ codigo: "El código debe tener 6 dígitos" });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const result = await verificarCodigoRecuperacionService(token, formData.codigo);

            if (result.error) {
                Toast.error("Error", result.message);
            } else {
                setVerificationToken(result.verificationToken);
                setCurrentStep(3);
                setTimeLeft(10 * 60); // 10 minutos para cambiar contraseña
                Toast.success("Éxito", "Código verificado correctamente");
            }
        } catch (error) {
            Toast.error("Error", "Error inesperado al verificar código");
        } finally {
            setLoading(false);
        }
    };

    // PASO 3: Cambiar contraseña
    const handleCambiarContraseña = async (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!formData.nuevaContraseña.trim()) {
            newErrors.nuevaContraseña = "La nueva contraseña es requerida";
        } else if (formData.nuevaContraseña.length < 8) {
            newErrors.nuevaContraseña = "La contraseña debe tener al menos 8 caracteres";
        }

        if (!formData.confirmarContraseña.trim()) {
            newErrors.confirmarContraseña = "Debe confirmar la nueva contraseña";
        } else if (formData.nuevaContraseña !== formData.confirmarContraseña) {
            newErrors.confirmarContraseña = "Las contraseñas no coinciden";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const result = await cambiarContraseñaRecuperacionService(
                verificationToken,
                formData.nuevaContraseña
            );

            if (result.error) {
                Toast.error("Error", result.message);
            } else {
                Toast.success("Éxito", "Contraseña recuperada exitosamente");
                setTimeout(() => {
                    router.push('/auth/login');
                }, 2000);
            }
        } catch (error) {
            Toast.error("Error", "Error inesperado al cambiar contraseña");
        } finally {
            setLoading(false);
        }
    };

    const handleVolverAtras = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setErrors({});
        }
    };

    const handleSolicitarNuevoCodigo = () => {
        setCurrentStep(1);
        setToken("");
        setTimeLeft(0);
        setErrors({});
        setFormData(prev => ({ ...prev, codigo: "" }));
    };

    const handleRestart = () => {
        setCurrentStep(1);
        setVerificationToken("");
        setTimeLeft(0);
        setErrors({});
        setFormData({
            email: "",
            codigo: "",
            nuevaContraseña: "",
            confirmarContraseña: ""
        });
    };

    return (
        <div className="flex flex-col justify-center min-h-[500px] md:min-h-[600px] p-6 md:p-8">
            <div className="w-full max-w-md mx-auto">

                {/* Header con paso actual */}
                <div className="text-center mb-6 md:mb-8">
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 md:mb-10 lg:mb-12 text-azulOscuro text-center drop-shadow-lg shadow-gray-400/50">
                        {currentStep === 1 && "Recuperar Contraseña"}
                        {currentStep === 2 && "Verificar Código"}
                        {currentStep === 3 && "Nueva Contraseña"}
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm lg:text-base px-2">
                        {currentStep === 1 && "Ingresa tu correo para recibir un código de verificación"}
                        {currentStep === 2 && "Ingresa el código de 6 dígitos enviado a tu correo"}
                        {currentStep === 3 && "Establece tu nueva contraseña"}
                    </p>

                    {/* Indicador de progreso */}
                    <div className="flex justify-center mt-4 md:mt-6 space-x-2 md:space-x-3">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 rounded-full transition-colors duration-300 ${step <= currentStep ? 'bg-primary-500' : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Timer */}
                    {timeLeft > 0 && currentStep > 1 && (
                        <div className="mt-3 md:mt-4 text-xs md:text-sm text-primary-600 font-medium">
                            Tiempo restante: {formatTime(timeLeft)}
                        </div>
                    )}
                </div>

                {/* Contenedor centrado para los formularios */}
                <div className="flex justify-center items-center ">
                    {/* PASO 1: Email */}
                    {currentStep === 1 && (
                        <Step1Email 
                            formData={formData}
                            errors={errors}
                            loading={loading}
                            handleChange={handleChange}
                            handleSolicitarRecuperacion={handleSolicitarRecuperacion}
                        />
                    )}

                    {/* PASO 2: Código */}
                    {currentStep === 2 && (
                        <Step2Code 
                            formData={formData}
                            errors={errors}
                            loading={loading}
                            timeLeft={timeLeft}
                            handleChange={handleChange}
                            handleVerificarCodigo={handleVerificarCodigo}
                            handleVolverAtras={handleVolverAtras}
                            handleSolicitarNuevoCodigo={handleSolicitarNuevoCodigo}
                        />
                    )}

                    {/* PASO 3: Nueva contraseña */}
                    {currentStep === 3 && (
                        <Step3Password 
                            formData={formData}
                            errors={errors}
                            loading={loading}
                            timeLeft={timeLeft}
                            showPasswords={showPasswords}
                            handleChange={handleChange}
                            handleCambiarContraseña={handleCambiarContraseña}
                            handleVolverAtras={handleVolverAtras}
                            togglePasswordVisibility={togglePasswordVisibility}
                            onRestart={handleRestart}
                        />
                    )}
                </div>

                <Divider className="my-6 md:my-8" />

                {/* Link mejorado para volver al login */}
                <div className="text-center">
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium transition-all duration-200 group hover:underline decoration-primary-600"
                    >
                        <svg 
                            className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                        </svg>
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RecuperarContraseñaForm;
