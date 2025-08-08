export function plantillaNuevaCuenta({ titulo, mensaje, datos = [] }) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <div style="background-color: #2a7ae2; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; position: relative;">
            <h1 style="color: white; margin: 0; font-size: 30px; font-weight: bold;">MiLoker</h1>
            <h2 style="color: rgba(255,255,255,0.8); margin: 8px 0; font-weight: normal; font-size: 16px;">${titulo}</h2>
        </div>
        
        <div style="padding: 40px 30px; background-color: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                ${mensaje}
            </p>
            
            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #2a7ae2;">
                <h3 style="color: #2a7ae2; margin: 0 0 15px 0; font-size: 18px;">📋 Detalles de tu cuenta:</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${datos.map(d => `
                        <li style="margin: 15px 0; padding: 15px 0; border-bottom: 1px solid #e9ecef;">
                            <div style="margin-bottom: 8px;">
                                <strong style="color: #495057; font-size: 14px;">${d.label}:</strong>
                            </div>
                            <div style="background: #e8f4fd; color: #1a365d; padding: 10px 15px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; border: 2px solid #2a7ae2; word-break: break-all;">${d.valor || 'No disponible'}</div>
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin: 25px 0;">
                <p style="color: #0c5460; margin: 0; font-size: 14px;">
                    🔐 <strong>Importante:</strong> Por seguridad, <strong>cambia tu contraseña</strong> después de iniciar sesión por primera vez.
                </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin: 25px 0 0 0; font-size: 14px;">
                ¡Bienvenido al sistema MiLoker! Tu cuenta ha sido creada exitosamente y ya puedes comenzar a usar nuestros servicios.
            </p>
            
            <div style="margin-top: 40px; padding-top: 25px; border-top: 2px solid #f1f3f4;">
                <p style="color: #888; font-size: 12px; margin: 0; text-align: center;">
                    Este es un mensaje automático generado por el sistema MiLoker.<br>
                    Por favor, no responder a este correo electrónico.
                </p>
                <p style="color: #aaa; font-size: 11px; text-align: center; margin: 10px 0 0 0;">
                    &copy; ${new Date().getFullYear()} MiLoker - Sistema de Gestión de Casilleros
                </p>
            </div>
        </div>
    </div>
    `;
}

export function plantillaRecuperacionContraseña({ nombreCompleto, codigoRecuperacion }) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
<div style="background-color: #2a7ae2; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; position: relative;">
    <h1 style="color: white; margin: 0; font-size: 30px; font-weight: bold;">MiLoker</h1>
    <h2 style="color: rgba(255,255,255,0.8); margin: 8px 0; font-weight: normal; font-size: 16px;">Recuperación de Contraseña</h2>
</div>
        
        <div style="padding: 40px 30px; background-color: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
                Hola <strong style="color: #2a7ae2;">${nombreCompleto}</strong>,
            </p>
            
            <p style="color: #555; line-height: 1.6; margin: 0 0 25px 0;">
                Has solicitado recuperar tu contraseña. Para continuar con el proceso de recuperación, 
                utiliza el siguiente código de verificación:
            </p>
            
            <div style="background-color: #2a7ae2; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);">
                <p style="color: white; margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Tu código de verificación es:</p>
                <h1 style="color: white; font-size: 48px; margin: 0; letter-spacing: 12px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    ${codigoRecuperacion}
                </h1>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 25px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                    ⏰ <strong>Importante:</strong> Este código es válido por <strong>15 minutos</strong>.
                </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin: 25px 0 0 0; font-size: 14px;">
                Si no solicitaste esta recuperación de contraseña, puedes ignorar este mensaje de forma segura. 
                Tu cuenta permanecerá protegida.
            </p>
            
            <div style="margin-top: 40px; padding-top: 25px; border-top: 2px solid #f1f3f4;">
                <p style="color: #888; font-size: 12px; margin: 0; text-align: center;">
                    Este es un mensaje automático generado por el sistema MiLoker.<br>
                    Por favor, no responder a este correo electrónico.
                </p>
                <p style="color: #aaa; font-size: 11px; text-align: center; margin: 10px 0 0 0;">
                    &copy; ${new Date().getFullYear()} MiLoker - Sistema de Gestión de Casilleros
                </p>
            </div>
        </div>
    </div>
    `;
}