const Joi = require("joi");

const { HttpError } = require("../helpers/index");
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} = require("../models/contacts");
const ctrWrapper = require("../decorators/ctrlWrapper");

const contactAddSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "missing required name field",
    "string.empty": "name can not be empty ",
  }),
  email: Joi.string().required().messages({
    "any.required": "missing required email field",
    "string.empty": "email can not be empty ",
  }),
  phone: Joi.string().required().messages({
    "any.required": "missing required phone field",
    "string.empty": "phone can not be empty ",
  }),
});

const contactPatchSchema = Joi.object({
  favorite: Joi.bool().required().messages({
    "any.required": "missing field favorite",
    "string.empty": "favorite can not be empty ",
  }),
});

const getAll = async (_, res) => {
  const result = await listContacts();
  res.json(result);
};

const getById = async (req, res) => {
  const id = req.params.contactId;
  const result = await getContactById(id);

  if (!result) {
    throw HttpError(404, `Not found`);
  }

  res.json(result);
};

const deleteById = async (req, res) => {
  const id = req.params.contactId;
  const result = await removeContact(id);

  if (!result) {
    throw HttpError(404, `Not found`);
  }

  res.json({ message: "contact deleted" });
};

const updateById = async (req, res) => {
  const body = req.body;
  const id = req.params.contactId;
  const { error } = contactAddSchema.validate(body);
  if (error) {
    throw HttpError(400, error.message);
  }

  const result = await updateContact(id, body);

  if (!result) {
    throw HttpError(404, `Not found`);
  }

  res.json(result);
};

const postNewContact = async (req, res) => {
  const body = req.body;
  const { error } = contactAddSchema.validate(body);
  if (error) {
    throw HttpError(400, error.message);
  }

  const result = await addContact(body);
  res.status(201).json(result);
};

const patchFavoriteById = async (req, res) => {
  const body = req.body;
  const id = req.params.contactId;
  const { error } = contactPatchSchema.validate(body);
  if (error) {
    throw HttpError(400, error.message);
  }

  const result = await updateStatusContact(id, body);

  if (!result) {
    throw HttpError(404, `Not found`);
  }

  res.json(result);
};

module.exports = {
  getAll: ctrWrapper(getAll),
  getById: ctrWrapper(getById),
  deleteById: ctrWrapper(deleteById),
  updateById: ctrWrapper(updateById),
  postNewContact: ctrWrapper(postNewContact),
  patchFavoriteById: ctrWrapper(patchFavoriteById),
};
