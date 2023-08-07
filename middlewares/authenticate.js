const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const { HttpError } = require("../helpers/index");

const ctrWrapper = require("../decorators/ctrlWrapper");
const { User } = require("../models/User");

dotenv.config();
const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;

  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    throw HttpError(401, "Not authorized");
  }

  const isTokenExist = await User.findOne({ token });

  if (!isTokenExist) {
    throw HttpError(401, "Not authorized");
  }

  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: id });

    if (!user || !user.token) {
      throw HttpError(401, "Not authorized");
    }

    req.user = user;
    next();
  } catch {
    throw HttpError(401, "Not authorized");
  }
};

module.exports = { authenticate: ctrWrapper(authenticate) };
