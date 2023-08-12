const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const { nanoid } = require("nanoid");

const { HttpError, sendEmail } = require("../helpers/index");
const { User } = require("../models/User");
const ctrWrapper = require("../decorators/ctrlWrapper");

const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
dotenv.config();

const userRegistrationSchema = Joi.object({
  email: Joi.string().pattern(emailPattern).required().messages({
    "any.required": "missing required email field",
    "string.empty": "email can not be empty ",
  }),
  password: Joi.string().min(6).required().messages({
    "any.required": "missing required password field",
    "string.empty": "password can not be empty ",
  }),
});

const secondVerifyTokenSchema = Joi.object({
  email: Joi.string().pattern(emailPattern).required().messages({
    "any.required": "missing required field email",
    "string.empty": "email can not be empty ",
  }),
});

const patchSubscriptionSchema = Joi.object({
  subscription: Joi.string()
    .valid("starter", "pro", "business")
    .required()
    .messages({
      "any.required": "missing required subscription field",
      "string.empty": "subscription can not be empty ",
      "any.only": "subscription must be one of 'starter', 'pro', 'business'",
    }),
});

const avatarDir = path.join(__dirname, "../", "public", "avatars");

const signUp = async (req, res) => {
  const { email } = req.body;
  const body = req.body;
  const { error } = userRegistrationSchema.validate(body);
  if (error) {
    throw HttpError(400, error.message);
  }

  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw HttpError(400, "Email in use");
  }

  const hashPassword = await bcrypt.hash(body.password, 10);
  const verificationToken = nanoid();

  const avatarURL = gravatar.url(email);
  body.password = hashPassword;
  body.avatarURL = avatarURL;
  body.verificationToken = verificationToken;

  const newUser = await User.create(body);

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a href="http://localhost:3000/api/auth/users/verify/${verificationToken}" target="_blank"> Click verify email</a>`,
  };
  await sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const verifyToken = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw HttpError(404, "User not found");
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  res.json({ message: "Verification successful" });
};

const secondVerifyToken = async (req, res) => {
  const { error } = secondVerifyTokenSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a href="http://localhost:3000/api/auth/users/verify/${user.verificationToken}" target="_blank"> Click verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Verification email sent",
  });
};

const { JWT_SECRET } = process.env;

const signIn = async (req, res) => {
  const { error } = userRegistrationSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(404, "Contact not found");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!user || !passwordCompare || !user.verify) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.status(200).json({
    token,
    user: {
      email,
      subscription: user.subscription,
    },
  });
};

const getCurrent = (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const logOut = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json();
};

const patchSubscription = async (req, res) => {
  const body = req.body;
  const subscription = body.subscription;
  const id = req.user._id;

  const { error } = patchSubscriptionSchema.validate(body);
  if (error) {
    throw HttpError(400, error.message);
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { subscription },
    { new: true, select: "email subscription " }
  );

  res.status(200).json(updatedUser);
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarDir, filename);

  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.status(200).json({ avatarURL });
};

module.exports = {
  signUp: ctrWrapper(signUp),
  signIn: ctrWrapper(signIn),
  getCurrent: ctrWrapper(getCurrent),
  logOut: ctrWrapper(logOut),
  patchSubscription: ctrWrapper(patchSubscription),
  updateAvatar: ctrWrapper(updateAvatar),
  verifyToken: ctrWrapper(verifyToken),
  secondVerifyToken: ctrWrapper(secondVerifyToken),
};
