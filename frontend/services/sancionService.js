const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

export const getSanciones = async () => {
    try {
        const response = await fetch(`${API_URL}/administrativo/sancion/visualizar`);
        const result = await handleResponse(response);
        if (result && result.error) return result;
        // Mapear para agregar el campo numero (índice + 1)
        return result.map((s, idx) => ({
            ...s,
            numero: idx + 1,
        }));
    } catch (error) {
        return { error: true, message: "Error de red al obtener sanciones" };
    }
};

export const createSancion = async (data) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/sancion/crear`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: "Error de red al crear sanción" };
    }
};

export const updateSancion = async (id, data) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/sancion/editar/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: "Error de red al editar sanción" };
    }
};

export const disableSancion = async (id) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/sancion/deshabilitar/${id}`, {
            method: "PUT" });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: "Error de red al deshabilitar sanción" };
    }
};
