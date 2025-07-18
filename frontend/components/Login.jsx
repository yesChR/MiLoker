import React, { useState } from "react";
import { Card, CardBody, Input, Button, Form } from "@heroui/react";
import { EyeFilledIcon } from "./icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "./icons/EyeSlashFilledIcon";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";

const Login = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Obtener datos del formulario usando FormData como en el ejemplo
    let formData = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setErrorMessage("Credenciales inválidas");
      } else if (result?.url) {
        router.push("/");
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
        {/* Sección izquierda con fondo e imagen */}
        <div className="w-full md:w-[380px] lg:w-[420px] bg-primario flex items-center justify-center py-8 md:py-0">
          <Image
            src="/candadoCerrado.png"
            alt="Logo"
            width={200}
            height={200}
            className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] lg:w-[220px] lg:h-[220px]"
          />
        </div>

        {/* Sección derecha con el formulario */}
        <CardBody className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-20 pb-8 md:pb-16 lg:pb-20">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 md:mb-10 lg:mb-12 text-azulOscuro text-center drop-shadow-lg shadow-gray-400/50">Inicio de sesión</h2>
          <Form
            className="flex flex-col items-center gap-4 md:gap-5"
            onSubmit={handleLogin}
          >
            {errorMessage && (
              <div className="w-full md:w-3/4 bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-700 text-sm font-medium">{errorMessage}</span>
                </div>
              </div>
            )}
            <div className="w-full md:w-3/4">
              <Input
                isRequired
                name="email"
                label="Correo electrónico"
                placeholder="juan@ejemplo.com"
                variant="bordered"
                className="focus:border-primario"
                errorMessage="El correo electrónico es obligatorio"
                type="email"
                autoFocus
                color="primary"
                size="sm"
                radius="md"
              />
            </div>
            <div className="w-full md:w-3/4">
              <Input
                isRequired
                name="password"
                endContent={
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
                }
                label="Contraseña"
                placeholder="********"
                type={isVisible ? "text" : "password"}
                variant="bordered"
                className="md:text-base"
                errorMessage="La contraseña es obligatoria"
                color="primary"
                size="sm"
                radius="md"
              />
            </div>
            <div className="w-full md:w-3/4 flex justify-end">
              <a href="/forgot-password" className="text-sm md:text-base text-primario hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="w-full md:w-3/4 flex justify-end">
              <Button
                className="bg-gradient-to-r from-primario to-blue-600 text-white w-[120px] md:w-[140px] lg:w-[160px] h-8 md:h-10 text-base md:text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 hover:from-blue-600 hover:to-primario transition-all duration-300 ease-in-out transform active:scale-95"
                type="submit"
                isLoading={loading}
                disabled={loading}
                radius="lg"
              >
                <span className="text-sm md:text-base">Iniciar sesión</span>
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;