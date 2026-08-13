const express = require("express");
const InstructoresController = require("../controllers/InstructoresController");

const api = express.Router();

api.get("/Instructores/:id", InstructoresController.getInstructorPublico);

module.exports = api;
