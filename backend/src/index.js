import app from './app.js'
import { sequelize } from './bd_config/conexion.js'

import './models/administrador.model.js'
import './models/armario.model.js'
import './models/bitacora.model.js'
import './models/casillero.model.js'
import './models/encargado.model.js'
import './models/especialidad.model.js'
import './models/estadoCasillero.model.js'
import './models/estadoIncidente.model.js'
import './models/estudiante.model.js'
import './models/estudianteXcasillero.model.js'
import './models/estudianteXEncargado.model.js'
import './models/estudianteXIncidente.model.js'
import './models/evidencia.model.js'
import './models/evidenciaXIncidente.model.js'
import './models/usuario.model.js'
import './models/profesor.model.js'
import './models/incidente.model.js'
import './models/periodo.model.js'
import './models/profesor.model.js'
import './models/sancion.model.js'
import './models/solicitud.model.js'
import './models/solicitudXcasillero.model.js'
import './models/usuario.model.js'

const main = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos exitosa');

    // Crear o actualizar las tablas sin borrar datos
    await sequelize.sync({ alter: true });

    app.listen(app.get('port'));
    console.log(`Servidor corriendo en el puerto ${app.get('port')}`);
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
  }
}

main();