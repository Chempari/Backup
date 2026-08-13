const express = require('express');
const UsuariosPublicController = require('../controllers/UsuariosPublicController');

const api = express.Router();

api.get('/Usuarios-publico/:id', UsuariosPublicController.getUsuarioPublico);

module.exports = api;
