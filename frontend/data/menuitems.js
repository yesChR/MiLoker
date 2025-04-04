import { FaChalkboardTeacher, FaBookReader } from "react-icons/fa";
import { GiLockers } from "react-icons/gi";
import { BsPersonFillExclamation, BsPersonFillGear } from "react-icons/bs";
import { BiSolidReport } from "react-icons/bi";

export const menuItems = [
  {
    id: 1,
    label: "Administración",
    icon: BsPersonFillGear,
    subItems: [
      { label: "Administradores", link: "/administrador/administrador" },
      { label: "Docentes", link: "/administrador/docentes" },
      { label: "Estudiantes", link: "/administrador/estudiantes" },
      { label: "Especialidades", link: "/administrador/especialidades" },
      { label: "Tipos de sanciones", link: "/administrador/tipo-sanciones" },
      { label: "Periodos de solicitud", link: "/administrador/perido-solicitud" },
    ],
  },
  {
    id: 2,
    label: "Docente",
    icon: FaChalkboardTeacher,
    subItems: [
      {
        label: "Solicitudes de casilleros",
        subItems: [
          { label: "En espera", link: "/docente/solicitudes/1" },
          { label: "Aprobadas", link: "/docente/solicitudes/2" },
          { label: "Rechazadas", link: "/docente/solicitudes/3" },
        ],
      },
      { label: "Alertas de incidencias", link: "/docente/alertas" },
      { label: "Crear usuarios", link: "/docente/usuarios" },
    ],
  },
  {
    id: 6,
    label: "Casillero",
    icon: GiLockers,
    link: "/casillero",
  },
  {
    id: 4,
    label: "Estudiante",
    icon: FaBookReader,
    subItems: [
      {
        label: "Solicitudes de casilleros",
        subItems: [{ label: "Estado solicitud", link: "/estudiantes/solicitud" }],
      },
      { label: "MiLocker", link: "/estudiante/miloker" },
    ],
  },
  {
    id: 5,
    label: "Incidente",
    icon: BsPersonFillExclamation,
    subItems: [{ label: "Lista de incidentes", link: "/incidente/lista" }],
  },
  {
    id: 6,
    label: "Informe",
    icon: BiSolidReport,
    link: "/informe",
  },
];