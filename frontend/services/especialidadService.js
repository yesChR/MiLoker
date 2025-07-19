const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Función auxiliar para manejar respuestas HTTP
const handleResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorCode = response.status;
        try {
            if (contentType && contentType.includes("application/json")) {
                const error = await response.json();
                errorMessage = error.error || error.message || errorMessage;
            } else {
                const text = await response.text();
                errorMessage = text || errorMessage;
            }
        } catch (parseError) {
            console.error('Error parsing response:', parseError);
        }
        return { error: true, message: errorMessage, code: errorCode };
    }
    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    }
    return await response.text();
};

export const createEspecialidad = async (especialidadData) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/especialidad/crear`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(especialidadData),
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: "Error de red al crear especialidad" };
    }
};

export const updateEspecialidad = async (id, especialidadData) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/especialidad/editar/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(especialidadData),
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: "Error de red al editar especialidad" };
    }
};

export const deleteEspecialidad = async (id) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/especialidad/eliminar/${id}`, {
            method: "DELETE",
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: "Error de red al eliminar especialidad" };
    }
};

export const getEspecialidades = async () => {
    try {
        const response = await fetch(`${API_URL}/administrativo/especialidad/visualizar`);
        const result = await handleResponse(response);
        if (result && result.error) return result;
        // Mapear para agregar el campo numero (índice + 1)
        return result.map((esp, idx) => ({
            ...esp,
            numero: idx + 1,
        }));
    } catch (error) {
        return { error: true, message: "Error de red al obtener especialidades" };
    }
};
