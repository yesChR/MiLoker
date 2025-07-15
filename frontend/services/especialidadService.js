const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const getEspecialidades = async () => {
    const response = await fetch(`${API_URL}/administrativo/especialidad/visualizar`);
    if (!response.ok) throw new Error("Error al obtener especialidades");
    return await response.json();
};
