const express = require("express");

const { HttpError } = require("../../helpers/index");
const Joi = require("joi");
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("../../models/contacts");

const router = express.Router();

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

router.get("/", async (req, res, next) => {
  try {
    const result = await listContacts();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  const id = req.params.contactId;
  try {
    const result = await getContactById(id);

    if (!result) {
      throw HttpError(404, `Not found`);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const body = req.body;

  try {
    const { error } = contactAddSchema.validate(body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const result = await addContact(body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const id = req.params.contactId;
  try {
    const result = await removeContact(id);

    if (!result) {
      throw HttpError(404, `Not found`);
    }

    res.json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  const body = req.body;
  const id = req.params.contactId;
  try {
    const { error } = contactAddSchema.validate(body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const result = await updateContact(id, body);

    if (!result) {
      throw HttpError(404, `Not found`);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
