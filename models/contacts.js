const { Contact } = require("./Contact");

const listContacts = async () => {
  const data = await Contact.find();

  return data;
};

const getContactById = async (contactId) => {
  return await Contact.findOne({ _id: contactId });
};

const removeContact = async (contactId) => {
  return await Contact.findByIdAndRemove({ _id: contactId });
};

const addContact = async ({ name, email, phone }) => {
  return Contact.create({ name, email, phone });
};

const updateContact = async (contactId, fields) => {
  const data = await Contact.findByIdAndUpdate({ _id: contactId }, fields);

  if (data) return getContactById(data._id);

  return data;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
