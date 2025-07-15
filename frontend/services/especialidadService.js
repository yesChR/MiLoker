export const createEspecialidad = async (especialidadData) => {
    const response = await fetch(`${API_URL}/especialidad/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(especialidadData),
    });
    if (!response.ok) throw new Error("Error al crear especialidad");
    return await response.json();
};

export const updateEspecialidad = async (id, especialidadData) => {
    const response = await fetch(`${API_URL}/especialidad/editar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(especialidadData),
    });
    if (!response.ok) throw new Error("Error al editar especialidad");
    return await response.json();
};

export const deleteEspecialidad = async (id) => {
    const response = await fetch(`${API_URL}/especialidad/eliminar/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Error al eliminar especialidad");
    return await response.json();
};
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";


export const getEspecialidades = async () => {
    const response = await fetch(`${API_URL}/especialidad/visualizar`);
    if (!response.ok) throw new Error("Error al obtener especialidades");
    const data = await response.json();
    // Mapear para agregar el campo numero (índice + 1)
    return data.map((esp, idx) => ({
        ...esp,
        numero: idx + 1,
    }));
};
