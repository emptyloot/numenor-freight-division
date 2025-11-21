const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { PubSub } = require('@google-cloud/pubsub'); //eslint-disable-line
const { sendDiscordMessage } = require('./discord');

const pubsub = new PubSub(); //eslint-disable-line

/**
 * @param {number} ms The number of milliseconds to sleep.
 * @returns {Promise<void>} A Promise that resolves after the specified time.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
    const formattedCargo = newData.cargo.map((item) => `**${item.quantity}** x ${item.name}`).join('\n');
    // Construct a Discord embed payload
    const payload = {
      // You can have content outside the embed
      content: documentId,
      embeds: [
        {
          title: 'New Shipment Created',
          description: `A new shipment for client ${newData.client} has been added to the system.`,
          color: 5814783, // A nice purple color (#58b9ff)
          fields: [
            { name: 'Origin', value: newData.port[0].name || 'N/A', inline: true },
            { name: 'Destination', value: newData.port[1].name || 'N/A', inline: true },
            { name: 'Cargo', value: formattedCargo || 'N/A', inline: false },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await sendDiscordMessage(payload);
    await sleep(1100);
  });
