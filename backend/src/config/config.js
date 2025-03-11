import { config } from 'dotenv';

config();

export default {
    port: process.env.PORT || '',
    email:process.env.EMAIL || '',
    pass: process.env.PASS || '',
    database: process.env.DATABASE || '',
    username: process.env.DB_USER_NAME || '',
    dbpass: process.env.DB_PASS || '',
    dbport: process.env.DB_PORT || '',
    dbhost: process.env.DB_HOST || '',
    authjwtsecret: process.env.DB_HOST || '',
}