import express from 'express';
import { visualizar } from '../../controllers/docente/alertas.controller';

const router = express.Router();

router.get('/visualizar', visualizar);

module.exports = router;