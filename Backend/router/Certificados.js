const express = require('express');
const CertificadosController = require('../controllers/CertificadosController');
const authMiddleware = require('../middlewares/authMiddleware');

const api = express.Router();

api.post('/Certificados', authMiddleware, CertificadosController.emitirCertificado);
api.get('/Certificados/mios', authMiddleware, CertificadosController.getMisCertificados);
api.get('/Certificados/:id', authMiddleware, CertificadosController.getCertificadoById);

module.exports = api;
