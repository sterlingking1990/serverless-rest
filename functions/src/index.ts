import * as functions from "firebase-functions";

import * as admin from "firebase-admin";
import * as firebaseHelper from "firebase-functions-helper";
import * as express from "express";
import * as bodyParser from "body-parser";
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const main = express();

const router = require("express").Router();

const contactsCollection = "contacts";
main.use("/api/v1", router);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});
// webApi is your functions name, and you will pass main as
// a parameter
export const webApi = functions.https.onRequest(main);

// Add new contact

interface Contact {
  firstName: String;
  lastName: String;
  email: String;
}

router.post("/contacts", async (req, res) => {
  try {
    const contact: Contact = {
      firstName: req.body["firstName"],
      lastName: req.body["lastName"],
      email: req.body["email"],
    };
    const newDoc = await firebaseHelper.firestoreHelper.createNewDocument(
      db,
      contactsCollection,
      contact
    );

    res.status(201).send(`Created a new contact: ${newDoc.id}`);
  } catch (error) {
    res
      .status(400)
      .send(`Contact should only contains firstName, lastName and email!!!`);
  }
});
// Update new contact
router.patch("/contacts/:contactId", async (req, res) => {
  const updatedDoc = await firebaseHelper.firestoreHelper.updateDocument(
    db,
    contactsCollection,
    req.params.contactId,
    req.body
  );
  res.status(204).send(`Update a new contact: ${updatedDoc}`);
});
// View a contact
router.get("/contacts/:contactId", (req, res) => {
  firebaseHelper.firestoreHelper
    .getDocument(db, contactsCollection, req.params.contactId)
    .then((doc) => res.status(200).send(doc))
    .catch((error) => res.status(400).send(`Cannot get contact: ${error}`));
});
// View all contacts
router.get("/contacts", (req, res) => {
  firebaseHelper.firestoreHelper
    .backup(contactsCollection)
    .then((data) => res.status(200).send(data))
    .catch((error) => res.status(400).send(`Cannot get contacts: ${error}`));
});
// Delete a contact
router.delete("/contacts/:contactId", async (req, res) => {
  const deletedContact = await firebaseHelper.firestoreHelper.deleteDocument(
    db,
    contactsCollection,
    req.params.contactId
  );
  res.status(204).send(`Contact is deleted: ${deletedContact}`);
});
