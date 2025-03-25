import { Card, CardBody, Input, Button } from "@heroui/react";
import { EyeFilledIcon } from "./icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "./icons/EyeSlashFilledIcon";
import React from "react";

const Login = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="flex justify-center items-center min-h-screen bg-fondoLogin">
      <Card className="flex flex-row w-[750px] h-[470px] shadow-lg" shadow="lg" radius="lg">
        {/* Sección izquierda con fondo e imagen */}
        <div className="w-[220px] bg-primario flex items-center justify-center">
          <img
            src="/path-to-your-image.jpg" // Cambia esta ruta por la de tu imagen
            alt="Login Illustration"
            className="w-3/4 h-auto"
          />
        </div>

        {/* Sección derecha con el formulario */}
        <CardBody className="w-1/2 flex flex-col justify-center p-8">
          <h2 className="text-3xl font-bold mb-10 text-azulOscuro text-center">Inicio de Sesión</h2>
          <div className="flex flex-col items-center">
            <div className="mb-6 w-3/4">
              <Input
                placeholder="Usuario"
                variant="bordered"
                className="focus:border-primario h-10 text-sm"
              />
            </div>
            <div className="mb-6 w-3/4">
              <Input
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                placeholder="Contraseña"
                type={isVisible ? "text" : "password"}
                variant="bordered"
              />
            </div>
            <div className="w-3/4 flex justify-end mb-2">
              <a href="/forgot-password" className="text-sm text-primario hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="w-3/4 flex justify-end">
              <Button className="bg-primario text-white w-[160px] hover:bg-primario-dark">
                Login
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;