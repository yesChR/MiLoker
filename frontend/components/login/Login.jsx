import React, { useState } from "react";
import { Card, CardBody } from "@heroui/react";
import { useRouter } from "next/router";
import { loginService } from "../../services/authService";
import LockAnimationSystem from "./LockAnimationSystem";
import LoginForm from "./LoginForm";
import { useLoginAnimations } from "../../hooks/useLoginAnimations";
import "../../styles/login-animations.css";

const Login = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();
  
  // Hook personalizado para las animaciones
  const { 
    isUnlocked, 
    showSuccess, 
    isClosing, 
    triggerSuccessAnimation 
  } = useLoginAnimations();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    let formData = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const result = await loginService(formData.email, formData.password);
      if (result && result.error) {
        setErrorMessage(result.message || "Credenciales inválidas");
      } else if (result && result.user) {
        // Activar la animación del candado abriéndose
        triggerSuccessAnimation();
        
        // Esperar un momento para mostrar la animación antes de redirigir
        setTimeout(() => {
          router.push("/");
        }, 2200); // Tiempo total optimizado: 1.2s abierto + 0.8s cerrando + 0.2s buffer
      } else {
        setErrorMessage("Ocurrió un error inesperado. Intente nuevamente.");
      }
    } catch (error) {
      setErrorMessage("Ocurrió un error. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-fondoLogin px-4 md:px-6">
      <Card className="flex flex-col md:flex-row w-full max-w-lg md:max-w-4xl lg:max-w-5xl h-auto md:min-h-[600px] shadow-lg pb-8 md:pb-0" shadow="lg" radius="lg">
        {/* Sección izquierda con animaciones del candado */}
        <LockAnimationSystem 
          isUnlocked={isUnlocked}
          showSuccess={showSuccess}
          isClosing={isClosing}
        />

        {/* Sección derecha con el formulario */}
        <CardBody className="w-full md:w-1/2 p-0">
          <LoginForm 
            isVisible={isVisible}
            toggleVisibility={toggleVisibility}
            handleLogin={handleLogin}
            loading={loading}
            errorMessage={errorMessage}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;
