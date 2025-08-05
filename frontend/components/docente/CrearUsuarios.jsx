import CabezeraDinamica from "../Layout/CabeceraDinamica"
import { Input, Button, useDisclosure } from "@heroui/react"
import { SearchIcon } from "../icons/SearchIcon"
import { Divider } from "@heroui/react";
import { LuSendHorizontal } from "react-icons/lu";
import { useState } from "react";
import { obtenerDatosEstudiantePorCedula, habilitarUsuarioEstudiante } from "../../services/usuarioDocenteService";
import Toast from "../CustomAlert";
import { PiBroomLight } from "react-icons/pi";

const CrearUsuarios = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [isLoading, setIsLoading] = useState(false);

    // Estados para los datos del formulario
    const [datosEstudiante, setDatosEstudiante] = useState({
        cedula: '',
        nombre: '',
        apellidoUno: '',
        apellidoDos: '',
        correo: '',
        telefono: '',
        fechaNacimiento: '',
        seccion: ''
    });

    const [primerEncargado, setPrimerEncargado] = useState({
        cedula: '',
        nombre: '',
        apellidoUno: '',
        apellidoDos: '',
        parentesco: '',
        correo: '',
        telefono: ''
    });

    const [segundoEncargado, setSegundoEncargado] = useState({
        cedula: '',
        nombre: '',
        apellidoUno: '',
        apellidoDos: '',
        parentesco: '',
        correo: '',
        telefono: ''
    });

    const [datosEncontrados, setDatosEncontrados] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [touchedFields, setTouchedFields] = useState({});

    const buscarEstudiante = async () => {
        if (!datosEstudiante.cedula.trim()) {
            Toast.error('Error', 'Por favor ingrese una cédula');
            return;
        }

        // Guardar la cédula antes de limpiar
        const cedulaBusqueda = datosEstudiante.cedula.trim();

        // Limpiar formulario antes de buscar, manteniendo la cédula
        limpiarFormulario(true);

        setIsLoading(true);
        try {
            const response = await obtenerDatosEstudiantePorCedula(cedulaBusqueda);

            // Verificar si hubo un error (estudiante no encontrado)
            if (response && response.error) {
                Toast.error('Estudiante no encontrado', 'No se encontró ningún estudiante con la cédula ingresada');
                setDatosEncontrados(false);
                return;
            }

            // Verificar si la respuesta es válida y contiene datos del estudiante
            if (!response) {
                Toast.error('Estudiante no encontrado', 'No se encontró ningún estudiante con la cédula ingresada');
                setDatosEncontrados(false);
                return;
            }

            // Verificar si existe el objeto estudiante en la respuesta
            if (!response.estudiante) {
                Toast.error('Estudiante no encontrado', 'No se encontró ningún estudiante con la cédula ingresada');
                setDatosEncontrados(false);
                return;
            }

            // Verificar si el estudiante tiene datos básicos
            if (!response.estudiante.cedula && !response.estudiante.nombre) {
                Toast.error('Datos incompletos', 'Los datos del estudiante están incompletos');
                setDatosEncontrados(false);
                return;
            }

            // Cargar datos del estudiante
            setDatosEstudiante(prev => ({
                ...prev,
                cedula: cedulaBusqueda, // Mantener la cédula buscada
                nombre: response.estudiante.nombre || '',
                apellidoUno: response.estudiante.apellidoUno || '',
                apellidoDos: response.estudiante.apellidoDos || '',
                correo: response.estudiante.correo || '',
                telefono: response.estudiante.telefono || '',
                fechaNacimiento: response.estudiante.fechaNacimiento || '',
                seccion: response.estudiante.seccion || ''
            }));

            // Cargar encargados si existen
            if (response.encargados && response.encargados.length > 0) {
                const primer = response.encargados[0];
                setPrimerEncargado({
                    cedula: primer.cedula || '',
                    nombre: primer.nombre || '',
                    apellidoUno: primer.apellidoUno || '',
                    apellidoDos: primer.apellidoDos || '',
                    parentesco: primer.parentesco || '',
                    correo: primer.correo || '',
                    telefono: primer.telefono || ''
                });

                if (response.encargados.length > 1) {
                    const segundo = response.encargados[1];
                    setSegundoEncargado({
                        cedula: segundo.cedula || '',
                        nombre: segundo.nombre || '',
                        apellidoUno: segundo.apellidoUno || '',
                        apellidoDos: segundo.apellidoDos || '',
                        parentesco: segundo.parentesco || '',
                        correo: segundo.correo || '',
                        telefono: segundo.telefono || ''
                    });
                }
            } else {
                // Limpiar encargados si no hay datos
                setPrimerEncargado({
                    cedula: '',
                    nombre: '',
                    apellidoUno: '',
                    apellidoDos: '',
                    parentesco: '',
                    correo: '',
                    telefono: ''
                });
                setSegundoEncargado({
                    cedula: '',
                    nombre: '',
                    apellidoUno: '',
                    apellidoDos: '',
                    parentesco: '',
                    correo: '',
                    telefono: ''
                });
            }

            setDatosEncontrados(true);
            Toast.success('Éxito', 'Datos del estudiante cargados exitosamente');

        } catch (error) {
            console.error('Error al buscar estudiante:', error);

            // Manejar cualquier error que pueda ocurrir
            if (error && error.status) {
                switch (error.status) {
                    case 400:
                        Toast.error('Cédula inválida', error.message || 'La cédula ingresada no es válida');
                        break;
                    case 404:
                        Toast.error('Estudiante no encontrado', 'No se encontró ningún estudiante con la cédula ingresada');
                        break;
                    case 500:
                    case 502:
                    case 503:
                        Toast.error('Error del servidor', 'Error interno del servidor. Intente nuevamente en unos momentos');
                        break;
                    default:
                        Toast.error('Error', error.message || 'Error al buscar el estudiante');
                }
            } else if (error && error.message) {
                if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
                    Toast.error('Error de conexión', 'No se pudo conectar con el servidor. Verifique su conexión a internet');
                } else if (error.message.includes('timeout')) {
                    Toast.error('Error de conexión', 'El servidor tardó demasiado en responder');
                } else {
                    Toast.error('Error', error.message);
                }
            } else {
                // Error completamente desconocido
                Toast.error('Estudiante no encontrado', 'No se encontró ningún estudiante con la cédula ingresada');
            }

            // Limpiar datos si hubo error
            setDatosEncontrados(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Activar la visualización de errores
        setShowErrors(true);

        if (!datosEncontrados) {
            Toast.error('Error', 'Primero debe buscar y cargar los datos del estudiante');
            return;
        }

        // Validar campos requeridos del primer encargado
        const requiredFields = ['cedula', 'nombre', 'apellidoUno', 'apellidoDos', 'parentesco', 'correo', 'telefono'];
        const emptyFields = requiredFields.filter(field => {
            const value = primerEncargado?.[field];
            return !value || !value.trim();
        });

        if (emptyFields.length > 0) {
            Toast.error('Error', 'Debe completar todos los campos requeridos del primer encargado');
            return;
        }

        // Validar segundo encargado solo si empezó a completar datos
        const hasSecondGuardianData = Object.values(segundoEncargado).some(value => value && value.trim());

        if (hasSecondGuardianData) {
            const secondRequiredFields = ['cedula', 'nombre', 'apellidoUno', 'apellidoDos', 'parentesco', 'correo', 'telefono'];
            const emptySecondFields = secondRequiredFields.filter(field => {
                const value = segundoEncargado?.[field];
                return !value || !value.trim();
            });

            if (emptySecondFields.length > 0) {
                Toast.error('Error', 'Si completa datos del segundo encargado, debe completar todos sus campos obligatorios');
                return;
            }
        }

        setIsLoading(true);
        try {
            const encargados = [primerEncargado];

            // Definir campos requeridos del segundo encargado
            const secondRequiredFields = ['cedula', 'nombre', 'apellidoUno', 'apellidoDos', 'parentesco', 'correo', 'telefono'];

            // Agregar segundo encargado solo si tiene todos los datos completos
            const hasCompleteSecondGuardian = secondRequiredFields.every(field => {
                const value = segundoEncargado?.[field];
                return value && value.trim();
            });

            if (hasCompleteSecondGuardian) {
                encargados.push(segundoEncargado);
            }

            const response = await habilitarUsuarioEstudiante(datosEstudiante.cedula, encargados);

            Toast.success('Éxito', response.message || 'Usuario habilitado exitosamente');

            // Limpiar formulario después del éxito
            limpiarFormulario();

        } catch (error) {
            Toast.error('Error', error.message || 'Error al habilitar el usuario');
        } finally {
            setIsLoading(false);
        }
    };

    const limpiarFormulario = (mantenerCedula = false) => {
        setDatosEstudiante({
            cedula: mantenerCedula ? datosEstudiante.cedula : '',
            nombre: '',
            apellidoUno: '',
            apellidoDos: '',
            correo: '',
            telefono: '',
            fechaNacimiento: '',
            seccion: ''
        });
        setPrimerEncargado({
            cedula: '',
            nombre: '',
            apellidoUno: '',
            apellidoDos: '',
            parentesco: '',
            correo: '',
            telefono: ''
        });
        setSegundoEncargado({
            cedula: '',
            nombre: '',
            apellidoUno: '',
            apellidoDos: '',
            parentesco: '',
            correo: '',
            telefono: ''
        });
        setDatosEncontrados(false);
        setShowErrors(false);
        setTouchedFields({});
    };

    const handleFieldBlur = (fieldName) => {
        setTouchedFields(prev => ({
            ...prev,
            [fieldName]: true
        }));
    };

    // Función helper para verificar si el segundo encargado tiene algún dato
    const hasSecondGuardianData = Object.values(segundoEncargado).some(value => value && value.trim());

    // El botón solo se bloquea si no se han cargado los datos del estudiante
    const isFormReadyToSubmit = datosEncontrados;

    // Debug: Ver estado del formulario en consola
    console.log('🔍 Estado del formulario:', {
        datosEncontrados,
        isFormReadyToSubmit,
        primerEncargado
    });

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Crear Usuarios"
                    breadcrumb="Inicio • Crear usuarios"
                />
            </div>
            <div className="mx-auto w-full max-w-5xl">
                <form onSubmit={handleSubmit} className="border-2 border-gray-200 rounded-lg p-3 sm:p-4 bg-white w-full">
                    <div>
                        <h2 className="text-md font-semibold text-gray-600">Datos del estudiante:</h2>
                        <p className="text-sm text-muted-foreground text-danger">* Digite la cédula del estudiante para cargar los datos</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
                            <div className="relative sm:col-span-2 lg:col-span-1">
                                <Input
                                    isRequired
                                    label="Cédula"
                                    placeholder="101110111"
                                    variant="bordered"
                                    color="primary"
                                    size="sm"
                                    radius="md"
                                    value={datosEstudiante.cedula}
                                    onChange={(e) => setDatosEstudiante(prev => ({ ...prev, cedula: e.target.value }))}
                                />
                                <button
                                    type="button"
                                    onClick={buscarEstudiante}
                                    disabled={isLoading}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-white transition-transform duration-200 hover:bg-primario hover:scale-105 w-[46px] h-[48px] bg-primario rounded-lg flex items-center justify-center disabled:opacity-50"
                                >
                                    <SearchIcon />
                                </button>
                            </div>
                            <Input
                                label="Nombre"
                                placeholder="María"
                                variant="bordered"
                                color="primary"
                                size="sm"
                                radius="md"
                                value={datosEstudiante.nombre}
                                onChange={(e) => setDatosEstudiante(prev => ({ ...prev, nombre: e.target.value }))}
                                isReadOnly
                                isRequired
                            />
                            <Input
                                label="Primer Apellido"
                                placeholder="Calderón"
                                variant="bordered"
                                color="primary"
                                size="sm"
                                radius="md"
                                value={datosEstudiante.apellidoUno}
                                onChange={(e) => setDatosEstudiante(prev => ({ ...prev, apellidoUno: e.target.value }))}
                                isReadOnly
                                isRequired
                            />
                            <Input
                                label="Segundo Apellido"
                                placeholder="Pérez"
                                variant="bordered"
                                color="primary"
                                size="sm"
                                radius="md"
                                value={datosEstudiante.apellidoDos}
                                onChange={(e) => setDatosEstudiante(prev => ({ ...prev, apellidoDos: e.target.value }))}
                                isReadOnly
                                isRequired
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
                            <Input
                                label="Fecha de Nacimiento"
                                placeholder="09/07/2008"
                                variant="bordered"
                                color="primary"
                                                                size="sm"
                                radius="md"
                                value={datosEstudiante.fechaNacimiento ? new Date(datosEstudiante.fechaNacimiento).toLocaleDateString('es-ES') : ''}
                                isReadOnly
                                isRequired
                            />
                            <Input
                                label="Teléfono"
                                placeholder="67895432"
                                variant="bordered"
                                color="primary"                                size="sm"
                                radius="md"
                                value={datosEstudiante.telefono}
                                isReadOnly
                                isRequired
                            />
                            <Input
                                label="Correo"
                                placeholder="ejemplo@dominio.com"
                                variant="bordered"
                                color="primary"
                                size="sm"
                                radius="md"
                                value={datosEstudiante.correo}
                                onChange={(e) => setDatosEstudiante(prev => ({ ...prev, correo: e.target.value }))}
                                isReadOnly
                                isRequired
                            />
                            <Input
                                label="Sección"
                                placeholder="11-1"
                                variant="bordered"
                                color="primary"
                                size="sm"
                                radius="md"
                                value={datosEstudiante.seccion}
                                onChange={(e) => setDatosEstudiante(prev => ({ ...prev, seccion: e.target.value }))}
                                isReadOnly
                                isRequired
                            />
                        </div>
                        <Divider className="my-4" />
                    </div>
                    <div>
                        <h2 className="text-md font-semibold text-gray-600">Datos del primer encargado:</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-2">
                            <Input
                                label="Cédula"
                                placeholder="701110111"
                                variant="bordered"
                                color="primary"
                                size="sm"
                                radius="md"
                                value={primerEncargado.cedula}
                                onChange={(e) => setPrimerEncargado(prev => ({ ...prev, cedula: e.target.value }))}
                                onBlur={() => handleFieldBlur('primerEncargado.cedula')}
                                isRequired
                                isInvalid={(showErrors || touchedFields['primerEncargado.cedula']) && !primerEncargado?.cedula?.trim()}
                                errorMessage="La cédula es obligatoria"
                            />
                            <Input
                                label="Nombre"
                                placeholder="Ana"
                                variant="bordered"
                                color="primary"
                                size="sm"
                                radius="md"
                                value={primerEncargado.nombre}
                                onChange={(e) => setPrimerEncargado(prev => ({ ...prev, nombre: e.target.value }))}
                                onBlur={() => handleFieldBlur('primerEncargado.nombre')}
                                isRequired
                                isInvalid={(showErrors || touchedFields['primerEncargado.nombre']) && !primerEncargado?.nombre?.trim()}
                                errorMessage="El nombre es obligatorio"
                            />
                            <Input
                                label="Primer Apellido"
                                placeholder="Gómez"
                                variant="bordered"
                                color="primary"
                                size="sm"
                                radius="md"
                                value={primerEncargado.apellidoUno}
                                onChange={(e) => setPrimerEncargado(prev => ({ ...prev, apellidoUno: e.target.value }))}
                                onBlur={() => handleFieldBlur('primerEncargado.apellidoUno')}
                                isRequired
                                isInvalid={(showErrors || touchedFields['primerEncargado.apellidoUno']) && !primerEncargado?.apellidoUno?.trim()}
                                errorMessage="El primer apellido es obligatorio"
                            />
                            <Input
                                label="Segundo Apellido"
                                placeholder="Rodríguez"
                                variant="bordered"
                                color="primary"
                                size="sm"
                                radius="md"
                                value={primerEncargado.apellidoDos}
                                onChange={(e) => setPrimerEncargado(prev => ({ ...prev, apellidoDos: e.target.value }))}
                                onBlur={() => handleFieldBlur('primerEncargado.apellidoDos')}
                                isRequired
                                isInvalid={(showErrors || touchedFields['primerEncargado.apellidoDos']) && !primerEncargado?.apellidoDos?.trim()}
                                errorMessage="El segundo apellido es obligatorio"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-2">
                            <Input
                                label="Parentesco"
                                placeholder="Madre"
                                variant="bordered"
                                color="primary"
                                size="sm"
                                radius="md"
                                value={primerEncargado.parentesco}
                                onChange={(e) => setPrimerEncargado(prev => ({ ...prev, parentesco: e.target.value }))}
                                onBlur={() => handleFieldBlur('primerEncargado.parentesco')}
                                isRequired
                                isInvalid={(showErrors || touchedFields['primerEncargado.parentesco']) && !primerEncargado?.parentesco?.trim()}
                                errorMessage="El parentesco es obligatorio"
                            />
                            <Input
                                label="Correo"
                                placeholder="ejemplo@dominio.com"
                                variant="bordered"
                                color="primary"
                                type="email"
                                size="sm"
                                radius="md"
                                value={primerEncargado.correo}
                                onChange={(e) => setPrimerEncargado(prev => ({ ...prev, correo: e.target.value }))}
                                onBlur={() => handleFieldBlur('primerEncargado.correo')}
                                isRequired
                                isInvalid={(showErrors || touchedFields['primerEncargado.correo']) && !primerEncargado?.correo?.trim()}
                                errorMessage="El correo es obligatorio"
                            />
                            <Input
                                label="Teléfono"
                                placeholder="87665544"
                                variant="bordered"
                                color="primary"
                                type="tel"
                                size="sm"
                                radius="md"
                                value={primerEncargado.telefono}
                                onChange={(e) => setPrimerEncargado(prev => ({ ...prev, telefono: e.target.value }))}
                                onBlur={() => handleFieldBlur('primerEncargado.telefono')}
                                isRequired
                                isInvalid={(showErrors || touchedFields['primerEncargado.telefono']) && !primerEncargado?.telefono?.trim()}
                                errorMessage="El teléfono es obligatorio"
                            />
                        </div>
                        <Divider className="my-4" />
                    </div>
                    <div>
                        <h2 className="text-md font-semibold text-gray-600">Datos del segundo encargado (opcional):</h2>
                        <p className="text-sm text-danger">* Si registra el segundo encargado, complete todos los campos</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-2">
                            <Input
                                label="Cédula"
                                placeholder="701110112"
                                variant="bordered"
                                color="primary"
                                size="sm"
                                radius="md"
                                value={segundoEncargado.cedula}
                                onChange={(e) => setSegundoEncargado(prev => ({ ...prev, cedula: e.target.value }))}
                                onBlur={() => handleFieldBlur('segundoEncargado.cedula')}
                                isInvalid={(showErrors || touchedFields['segundoEncargado.cedula']) && hasSecondGuardianData && !segundoEncargado?.cedula?.trim()}
                                errorMessage="La cédula es obligatoria"
                            />
                            <Input
                                label="Nombre"
                                placeholder="Juan"
                                variant="bordered"
                                color="primary"
                                size="sm"
                                radius="md"
                                value={segundoEncargado.nombre}
                                onChange={(e) => setSegundoEncargado(prev => ({ ...prev, nombre: e.target.value }))}
                                onBlur={() => handleFieldBlur('segundoEncargado.nombre')}
                                isInvalid={(showErrors || touchedFields['segundoEncargado.nombre']) && hasSecondGuardianData && !segundoEncargado?.nombre?.trim()}
                                errorMessage="El nombre es obligatorio"
                            />
                            <Input
                                label="Primer Apellido"
                                placeholder="Gómez"
                                variant="bordered"
                                color="primary"
                                size="sm"
                                radius="md"
                                value={segundoEncargado.apellidoUno}
                                onChange={(e) => setSegundoEncargado(prev => ({ ...prev, apellidoUno: e.target.value }))}
                                onBlur={() => handleFieldBlur('segundoEncargado.apellidoUno')}
                                isInvalid={(showErrors || touchedFields['segundoEncargado.apellidoUno']) && hasSecondGuardianData && !segundoEncargado?.apellidoUno?.trim()}
                                errorMessage="El primer apellido es obligatorio"
                            />
                            <Input
                                label="Segundo Apellido"
                                placeholder="Pérez"
                                variant="bordered"
                                color="primary"
                                size="sm"
                                radius="md"
                                value={segundoEncargado.apellidoDos}
                                onChange={(e) => setSegundoEncargado(prev => ({ ...prev, apellidoDos: e.target.value }))}
                                onBlur={() => handleFieldBlur('segundoEncargado.apellidoDos')}
                                isInvalid={(showErrors || touchedFields['segundoEncargado.apellidoDos']) && hasSecondGuardianData && !segundoEncargado?.apellidoDos?.trim()}
                                errorMessage="El segundo apellido es obligatorio"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-2">
                            <Input
                                label="Parentesco"
                                placeholder="Padre"
                                variant="bordered"
                                color="primary"
                                size="sm"
                                radius="md"
                                value={segundoEncargado.parentesco}
                                onChange={(e) => setSegundoEncargado(prev => ({ ...prev, parentesco: e.target.value }))}
                                onBlur={() => handleFieldBlur('segundoEncargado.parentesco')}
                                isInvalid={(showErrors || touchedFields['segundoEncargado.parentesco']) && hasSecondGuardianData && !segundoEncargado?.parentesco?.trim()}
                                errorMessage="El parentesco es obligatorio"
                            />
                            <Input
                                label="Correo"
                                placeholder="ejemplo@dominio.com"
                                variant="bordered"
                                color="primary"
                                type="email"
                                size="sm"
                                radius="md"
                                value={segundoEncargado.correo}
                                onChange={(e) => setSegundoEncargado(prev => ({ ...prev, correo: e.target.value }))}
                                onBlur={() => handleFieldBlur('segundoEncargado.correo')}
                                isInvalid={(showErrors || touchedFields['segundoEncargado.correo']) && hasSecondGuardianData && !segundoEncargado?.correo?.trim()}
                                errorMessage="El correo es obligatorio"
                            />
                            <Input
                                label="Teléfono"
                                placeholder="87665544"
                                variant="bordered"
                                color="primary"
                                type="tel"
                                size="sm"
                                radius="md"
                                value={segundoEncargado.telefono}
                                onChange={(e) => setSegundoEncargado(prev => ({ ...prev, telefono: e.target.value }))}
                                onBlur={() => handleFieldBlur('segundoEncargado.telefono')}
                                isInvalid={(showErrors || touchedFields['segundoEncargado.telefono']) && hasSecondGuardianData && !segundoEncargado?.telefono?.trim()}
                                errorMessage="El teléfono es obligatorio"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <Button
                            type="button"
                            variant="bordered"
                            color="default"
                            className="px-6"
                            onClick={() => limpiarFormulario()}
                        >
                            Limpiar <PiBroomLight />
                        </Button>
                        <Button
                            type="submit"
                            className={`px-6 text-white w-full sm:w-auto ml-4 ${
                                !isFormReadyToSubmit 
                                    ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                                    : 'bg-primario hover:bg-primario'
                            }`}
                            endContent={<LuSendHorizontal />}
                            disabled={!isFormReadyToSubmit}
                        >
                            Enviar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearUsuarios
