const express = require("express");

const { authenticate, upload } = require("../../middlewares");

const authRouter = express.Router();

const {
  signUp,
  signIn,
  getCurrent,
  logOut,
  patchSubscription,
  updateAvatar,
  verifyToken,
  secondVerifyToken,
} = require("../../controllers/users-controllers");

authRouter.post("/users/register", signUp);

authRouter.get("/users/verify/:verificationToken", verifyToken);

authRouter.post("/users/verify", secondVerifyToken);

authRouter.post("/users/login", signIn);

authRouter.get("/users/current", authenticate, getCurrent);

authRouter.post("/users/logout", authenticate, logOut);

authRouter.patch("/users", authenticate, patchSubscription);

authRouter.patch(
  "/users/avatars",
  authenticate,
  upload.single("avatar"),
  updateAvatar
);

module.exports = { authRouter };
