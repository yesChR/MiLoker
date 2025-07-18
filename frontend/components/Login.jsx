import React, { useState, useCallback } from "react";
import { Card, CardBody, Input, Button, Form } from "@heroui/react";
import { EyeFilledIcon } from "./icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "./icons/EyeSlashFilledIcon";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";

const Login = () => {
  const [email, setEmail] = useState(""); // Cambiado a email para consistencia
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = React.useState(false);
  const [loading, setLoading] = useState(false); // Estado faltante
  const [errorMessage, setErrorMessage] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);



  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setShowErrors(true);
      setLoading(true);
      setErrorMessage(null);

      // Validación simple
      const emailValid = email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      const passwordValid = password && password.length > 0;
      if (!emailValid || !passwordValid) {
        setLoading(false);
        return;
      }

      try {
        const result = await signIn("credentials", {
          redirect: false,
          email: email,
          password: password,
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
    },
    [router, email, password]
  );



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
          <Form
            className="flex flex-col items-center gap-4 md:gap-6"
            onSubmit={handleLogin}
          >
            <div className="w-full md:w-3/4">
              <Input
                isRequired
                name="email"
                label="Correo electrónico"
                placeholder="juan@ejemplo.com"
                variant="bordered"
                className="focus:border-primario h-10 text-sm md:h-12 md:text-base"
                value={email}
                onChange={e => setEmail(e.target.value)}
                isInvalid={showErrors && (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))}
                errorMessage={
                  showErrors && !email
                    ? "El correo es obligatorio"
                    : showErrors && email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
                    ? "Correo inválido"
                    : undefined
                }
                type="email"
                autoFocus
                color="primary"
              />
            </div>
            <div className="w-full md:w-3/4">
              <Input
                isRequired
                name="password"
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeSlashFilledIcon className="text-base md:text-lg text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-base md:text-lg text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                label="Contraseña"
                placeholder="********"
                type={isVisible ? "text" : "password"}
                variant="bordered"
                className="md:h-12 md:text-base"
                value={password}
                onChange={e => setPassword(e.target.value)}
                isInvalid={showErrors && !password}
                errorMessage={showErrors && !password ? "La contraseña es obligatoria" : undefined}
                color="primary"
              />
            </div>
            <div className="w-full md:w-3/4 flex justify-end">
              <a href="/forgot-password" className="text-sm md:text-base text-primario hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            {errorMessage && (
              <div className="w-full md:w-3/4 text-red-500 text-sm text-right">{errorMessage}</div>
            )}
            <div className="w-full md:w-3/4 flex justify-end">
              <Button
                className="bg-primario text-white w-[100px] md:w-[170px] h-10 md:h-12 text-base md:text-lg hover:bg-primario-dark"
                type="submit"
                isLoading={loading}
                disabled={loading}
              >
                Login
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;