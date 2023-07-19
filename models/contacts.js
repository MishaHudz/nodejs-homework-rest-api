const fs = require("fs/promises");
const path = require("path");

const { nanoid } = require("nanoid");

const contactsPath = path.join(__dirname, "contacts.json");

const listContacts = async () => {
  const data = JSON.parse(await fs.readFile(contactsPath, "utf-8"));

  return data;
};

const getContactById = async (contactId) => {
  const contactsArr = await listContacts();
  const findedObj = contactsArr.find((obj) => obj.id === contactId);

  return findedObj || null;
};

const removeContact = async (contactId) => {
  const contactsArr = await listContacts();
  let deletedContact = null;
  const newContactArr = [];

  for (const contact of contactsArr) {
    if (contact.id === contactId) {
      deletedContact = contact;
      continue;
    }
    newContactArr.push(contact);
  }

  deletedContact &&
    fs.writeFile(contactsPath, JSON.stringify(newContactArr, null, 2));

  return deletedContact;
};

const addContact = async ({ name, email, phone }) => {
  const newContact = {
    id: nanoid(),
    name,
    email,
    phone,
  };
  const contactsArr = await listContacts();
  const isOlredyExist = contactsArr.find((contact) => contact.email === email);
  if (!isOlredyExist) {
    contactsArr.push(newContact);

    fs.writeFile(contactsPath, JSON.stringify(contactsArr, null, 2));

    return newContact;
  }
};

const updateContact = async (contactId, { name, email, phone }) => {
  const contactsArr = await listContacts();

  const indexOfUpdatedContact = contactsArr.findIndex(
    (contact) => contact.id === contactId
  );

  if (indexOfUpdatedContact === -1) return null;

  const updatedContact = { id: contactId, name, email, phone };
  contactsArr[indexOfUpdatedContact] = updatedContact;
  fs.writeFile(contactsPath, JSON.stringify(contactsArr, null, 2));
  return updatedContact;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
