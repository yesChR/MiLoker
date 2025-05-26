export function plantillaNuevaCuenta({ titulo, mensaje, datos = [] }) {
    return `
    <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 30px;">
        <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #e0e0e0; padding: 30px;">
            <h2 style="color: #2a7ae2; text-align: center;">${titulo}</h2>
            <div style="margin: 20px 0;">
                <p>${mensaje}</p>
                <ul style="list-style: none; padding: 0;">
                    ${datos.map(d => `<li><b>${d.label}:</b> <span style="background: #f0f4f8; padding: 3px 3px; border-radius: 4px;">${d.valor}</span></li>`).join('')}
                </ul>
            </div>
            <p style="color: #888; font-size: 13px;">Por seguridad, cambia tu contraseña después de iniciar sesión.</p>
            <hr style="margin: 24px 0;">
            <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} MiLoker</p>
        </div>
    </div>
    `;
}