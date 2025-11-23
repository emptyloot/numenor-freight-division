const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { PubSub } = require('@google-cloud/pubsub'); //eslint-disable-line
const { sendDiscordMessage } = require('./discord');
const { wait } = require('../utils/wait');
const { createShipmentPayload } = require('../utils/discordPayload');

const pubsub = new PubSub(); //eslint-disable-line

exports.onNewDataEntry = functions.firestore.document('shipments/{documentId}').onCreate(async (snap, context) => {
  const topic = pubsub.topic('shipments-topic'); //eslint-disable-line
  const documentId = context.params.documentId;
  await topic.publishMessage({ data: Buffer.from(documentId) });
});

exports.processShipment = functions
  .runWith({ concurrency: 1 })
  .pubsub.topic('shipments-topic') //eslint-disable-line
  .onPublish(async (message) => {
    const documentId = message.data ? Buffer.from(message.data, 'base64').toString() : null;
    if (!documentId) {
      console.error('No documentId in Pub/Sub message');
      return;
    }
    const snap = await admin.firestore().collection('shipments').doc(documentId).get();
    const newData = snap.data();
    const payload = createShipmentPayload(documentId, newData);

    await sendDiscordMessage(payload);
    await wait(1100);
  });
