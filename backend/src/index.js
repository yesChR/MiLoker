import app from './app.js'
import { sequelize } from './bd_config/conexion.js';

const main = async () => {
  try {
    await sequelize.authenticate();
    console.log('Se realizó con exito la conexion a la bd');
    // Automatically create all tables
    await sequelize.sync();
    //Aqui se habilita servidor web de node.js nada más
    app.listen(app.get('port'));
    console.log(`Corriendo en el puerto ${app.get('port')}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}



main();





