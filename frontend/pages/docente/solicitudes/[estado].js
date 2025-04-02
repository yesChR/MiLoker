import { useRouter } from "next/router";
import Solicitudes from "@/components/docente/Solicitudes";

const SolicitudesPage = () => {
    const router = useRouter();
    const { estado } = router.query; // Recoge el parámetro dinámico "estado"

    // Verifica si el parámetro es numérico
    const estadoNumerico = parseInt(estado, 10);
    if (isNaN(estadoNumerico)) {
        return <p>El parámetro "estado" debe ser un número válido.</p>;
    }

    return (
        <Solicitudes estado={estadoNumerico} />
    );
};

export default SolicitudesPage;