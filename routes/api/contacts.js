const express = require("express");

const router = express.Router();

const { isValidId } = require(`../../middlewares`);

const {
  getAll,
  getById,
  deleteById,
  updateById,
  postNewContact,
  patchFavoriteById,
} = require("../../controllers/contacts-controllers");

router.get("/", getAll);

router.get("/:contactId", isValidId, getById);

router.post("/", postNewContact);

router.delete("/:contactId", isValidId, deleteById);

router.put("/:contactId", isValidId, updateById);

router.patch("/:contactId/favorite", isValidId, patchFavoriteById);

module.exports = router;
