const express = require("express");

const { authenticate } = require("../../middlewares");

const authRouter = express.Router();

const {
  signUp,
  signIn,
  getCurrent,
  logOut,
} = require("../../controllers/users-controllers");

authRouter.post("/users/register", signUp);

authRouter.post("/users/login", signIn);

authRouter.get("/users/current", authenticate, getCurrent);

authRouter.post("/users/logout", authenticate, logOut);

module.exports = { authRouter };
