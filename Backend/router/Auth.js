const express = require("express");
const { register, login, getMe, refreshToken, updateProfile } = require("../controllers/AuthController");
const authMiddleware = require("../middlewares/authMiddleware");

const api = express.Router();

api.post("/auth/register", register);
api.post("/auth/login", login);
api.get("/auth/me", authMiddleware, getMe);
api.post("/auth/refresh", authMiddleware, refreshToken);
api.put("/auth/profile", authMiddleware, updateProfile);

module.exports = api;