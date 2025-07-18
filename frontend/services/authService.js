const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginService(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !data.user) return null;
    return data.user;
  } catch (error) {
    console.error('Error en loginService:', error);
    return null;
  }
}
