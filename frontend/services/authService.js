const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
      // No hacer nada extra
    }
    return { error: true, message: errorMessage, code: errorCode };
  }
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }
  return await response.text();
};

export async function loginService(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(res);
    if (data && data.error) {
      return { error: true, message: data.message || "Credenciales incorrectas" };
    }
    if (!data.success || !data.user) {
      return { error: true, message: data.message || "Credenciales incorrectas" };
    }
    return { user: data.user };
  } catch (error) {
    return { error: true, message: 'Error de red al iniciar sesión' };
  }
}
