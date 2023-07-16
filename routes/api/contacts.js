const express = require("express");

const router = express.Router();

const {
  getAll,
  getById,
  deleteById,
  updateById,
  postNewContact,
} = require("../../controllers/contacts-controllers");

router.get("/", getAll);

router.get("/:contactId", getById);

router.post("/", postNewContact);

router.delete("/:contactId", deleteById);

router.put("/:contactId", updateById);

module.exports = router;
