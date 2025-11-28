const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { PubSub } = require('@google-cloud/pubsub'); //eslint-disable-line
const { sendDiscordMessage, updateDiscordMessage } = require('./discord');
const { createShipmentPayload } = require('../utils/discordPayload');

const pubsub = new PubSub(); //eslint-disable-line

exports.onNewDataEntry = functions.firestore.document('shipments/{documentId}').onCreate(async (snap, context) => {
  const topic = pubsub.topic('shipments-topic'); //eslint-disable-line
  const { documentId } = context.params;
  const payload = { type: 'CREATE', documentId };
  await topic.publishMessage({ json: payload });
  console.log(`Published CREATE job for ${documentId}`);
});

exports.onUpdateDataEntry = functions.firestore.document('shipments/{documentId}').onUpdate(async (change, context) => {
  const { documentId } = context.params;
  const newData = change.after.data();
  const oldData = change.before.data();

  if (newData.status !== oldData.status) {
    return;
  }

  const topic = pubsub.topic('shipments-topic'); //eslint-disable-line
  const payload = { type: 'UPDATE', documentId, messageId: newData.discordMessageId };
  await topic.publishMessage({ json: payload });
  console.log(`Published UPDATE job for ${documentId}`);
});

exports.processShipment = functions
  .runWith({ concurrency: 1 })
  .pubsub.topic('shipments-topic') //eslint-disable-line
  .onPublish(async (message) => {
    const { type, documentId, messageId } = message.json;
    if (!documentId) {
      console.error('No documentId in Pub/Sub message');
      return;
    }
    const snap = await admin.firestore().collection('shipments').doc(documentId).get();
    if (!snap.exists) {
      console.error(`Document ${documentId} does not exist.`);
      return;
    }
    const newData = snap.data();
    const payload = createShipmentPayload(documentId, newData);
    switch (type) {
      case 'CREATE':
        console.log(`Processing CREATE for ${documentId}`);
        const newMessageId = await sendDiscordMessage(payload);
        if (newMessageId) {
          await snap.ref.update({
            discordMessageId: newMessageId,
          });
          console.log(`Successfully updated doc ${documentId} with message ID ${newMessageId}`);
        }
        break;
      case 'UPDATE':
        console.log(`Processing UPDATE for ${documentId} with message ${messageId}`);
        await updateDiscordMessage(messageId, payload);
        console.log(`Sent update request for message ${messageId}`);
        break;
      default:
        console.error(`Unknown message type: ${type}`);
        return;
    }
  });
