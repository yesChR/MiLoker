import { Card, CardBody, Input, Button } from "@heroui/react";
import { EyeFilledIcon } from "./icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "./icons/EyeSlashFilledIcon";
import React from "react";
import Image from "next/image";

const Login = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

return (
  <div className="flex justify-center items-center min-h-screen bg-fondoLogin px-4 md:px-2">
    <Card className="flex flex-col md:flex-row w-full max-w-md md:max-w-3xl h-auto md:min-h-[500px] shadow-lg pb-8 md:pb-0" shadow="lg" radius="lg">
      {/* Sección izquierda con fondo e imagen */}
      <div className="w-full md:w-[320px] bg-primario flex items-center justify-center py-6 md:py-0">
        <Image
          src="/candadoCerrado.png"
          alt="Logo"
          width={180}
          height={180}
          className="w-[120px] h-[120px] md:w-[180px] md:h-[180px]"
        />
      </div>

      {/* Sección derecha con el formulario */}
      <CardBody className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-14 pb-8 md:pb-14">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-azulOscuro text-center">Inicio de sesión</h2>
        <div className="flex flex-col items-center gap-4 md:gap-6">
          <div className="w-full md:w-3/4">
            <Input
              placeholder="Usuario"
              variant="bordered"
              className="focus:border-primario h-10 text-sm md:h-12 md:text-base"
            />
          </div>
          <div className="w-full md:w-3/4">
            <Input
              endContent={
                <button
                  aria-label="toggle password visibility"
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-2xl md:text-3xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl md:text-3xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              placeholder="Contraseña"
              type={isVisible ? "text" : "password"}
              variant="bordered"
              className="md:h-12 md:text-base"
            />
          </div>
          <div className="w-full md:w-3/4 flex justify-end">
            <a href="/forgot-password" className="text-sm md:text-base text-primario hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="w-full md:w-3/4 flex justify-end">
            <Button className="bg-primario text-white w-[100px] md:w-[170px] h-10 md:h-12 text-base md:text-lg hover:bg-primario-dark">
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