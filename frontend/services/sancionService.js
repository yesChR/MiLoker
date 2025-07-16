const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function getSanciones() {
  const res = await fetch(`${API_URL}/administrativo/sancion/visualizar`);
  if (!res.ok) throw new Error("Error al obtener sanciones");
  return await res.json();
}

export async function createSancion(data) {
  const res = await fetch(`${API_URL}/administrativo/sancion/crear`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al crear sanción");
  return await res.json();
}

export async function updateSancion(id, data) {
  const res = await fetch(`${API_URL}/administrativo/sancion/editar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al editar sanción");
  return await res.json();
}

export async function disableSancion(id) {
  const res = await fetch(`${API_URL}/administrativo/sancion/deshabilitar/${id}`, {
    method: "PUT" });
  if (!res.ok) throw new Error("Error al deshabilitar sanción");
  return await res.json();
}
