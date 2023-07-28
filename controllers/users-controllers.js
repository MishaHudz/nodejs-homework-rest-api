const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const { HttpError } = require("../helpers/index");
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

const signUp = async (req, res) => {
  const body = req.body;
  const { error } = userRegistrationSchema.validate(body);
  if (error) {
    throw HttpError(400, error.message);
  }

  const hashPassword = await bcrypt.hash(body.password, 10);
  body.password = hashPassword;
  const newUser = await User.create(body);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
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

  if (!user || !passwordCompare) {
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

module.exports = {
  signUp: ctrWrapper(signUp),
  signIn: ctrWrapper(signIn),
  getCurrent: ctrWrapper(getCurrent),
  logOut: ctrWrapper(logOut),
};
