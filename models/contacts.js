const { Contact } = require("./Contact");

const listContacts = async (owner, page, limit, favorite) => {
  const findFilter = { owner };

  if (favorite !== "") {
    findFilter.favorite = favorite;
  }

  const data = await Contact.find(findFilter, "", {
    skip: (page - 1) * limit,
    limit,
  }).populate("owner", "email subscription");

  return data;
};

const getContactById = async (contactId) => {
  return await Contact.findById(contactId);
};

const removeContact = async (contactId) => {
  return await Contact.findByIdAndRemove({ _id: contactId });
};

const addContact = async ({ name, email, phone, owner }) => {
  return Contact.create({ name, email, phone, owner });
};

const updateContact = async (contactId, fields) => {
  const data = await Contact.findByIdAndUpdate({ _id: contactId }, fields, {
    new: true,
  });

  return data;
};

const updateStatusContact = async (contactId, field) => {
  const data = await Contact.findByIdAndUpdate({ _id: contactId }, field, {
    new: true,
  });

  return data;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
