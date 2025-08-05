import { useRouter } from "next/router";
import Solicitudes from "@/components/docente/solicitudesCasilleros/Solicitudes";

const SolicitudesPage = () => {
    const router = useRouter();
    const { estado } = router.query; // Recoge el parámetro dinámico "estado"

    // Verifica si el parámetro es numérico
    const estadoNumerico = parseInt(estado, 10);

    return (
        <Solicitudes estado={estadoNumerico} />
    );
};

export default SolicitudesPage;