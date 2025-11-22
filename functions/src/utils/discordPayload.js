/**
 * Creates a Discord embed payload for a new shipment notification.
 * @param {string} documentId - The ID of the shipment document.
 * @param {object} shipmentData - The data of the shipment from Firestore.
 * @returns {object} The Discord payload object.
 */
const createShipmentPayload = (documentId, shipmentData) => {
  const formattedCargo = shipmentData.cargo.map((item) => `**${item.quantity}** x ${item.name}`).join('\n');

  const payload = {
    content: documentId,
    embeds: [
      {
        title: 'New Shipment Created',
        description: `A new shipment for client ${shipmentData.client} has been added to the system.`,
        color: 5814783, // A nice purple color (#58b9ff)
        fields: [
          { name: 'Origin', value: shipmentData.port[0].name || 'N/A', inline: true },
          { name: 'Destination', value: shipmentData.port[1].name || 'N/A', inline: true },
          { name: 'Cargo', value: formattedCargo || 'N/A', inline: false },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return payload;
};

module.exports = { createShipmentPayload };
