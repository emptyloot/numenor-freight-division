/**
 * Creates a Discord embed payload for a new shipment notification.
 * @param {string} documentId - The ID of the shipment document.
 * @param {object} shipmentData - The data of the shipment from Firestore.
 * @returns {object} The Discord payload object.
 */
const createShipmentPayload = (documentId, shipmentData) => {
  const formattedCargo = shipmentData.cargo.map((item) => `**${item.quantity}** x ${item.name}`).join('\n');

  /**
   * Helper to format locations with explicit North/East coordinates.
   * @param {object} portObject - The port data containing name, north, and east.
   * @returns {string} A formatted string with bold name and italicized coordinates.
   */
  const formattedLocation = (portObject) => {
    if (!portObject) return 'unknown';
    return `**${portObject.name}**\n*(North: ${portObject.north},East: ${portObject.east})*`;
  };

  let driverDisplayed = '**Unassigned**';
  if (shipmentData.driverName) {
    driverDisplayed = shipmentData.driverName;
  }

  const formattedStatus = shipmentData.status.charAt(0).toUpperCase() + shipmentData.status.slice(1);

  const payload = {
    content: `New Logistics Order: ${documentId}`,
    embeds: [
      {
        title: `🚛 Transport Work Order`,
        description: `Client **${shipmentData.client}** requires transport.`,
        // Purple (5814783) if assigned, Orange (15105570) if unassigned
        color: shipmentData.driverId ? 5814783 : 15105570,
        fields: [
          {
            name: '📍 Pickup (Origin)',
            value: formattedLocation(shipmentData.port[0]),
            inline: true,
          },
          {
            name: '🏁 Drop off (Destination)',
            value: formattedLocation(shipmentData.port[1]),
            inline: true,
          },
          {
            name: '📋 Assignment Details',
            // Now displays the Driver Name properly
            value: `**Status:** ${formattedStatus}\n**Driver:** ${driverDisplayed}`,
            inline: false,
          },
          {
            name: '📦 Cargo Manifest',
            value: formattedCargo || 'No Cargo Listed',
            inline: false,
          },
        ],
        footer: {
          text: `System ID: ${documentId}`,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return payload;
};

module.exports = { createShipmentPayload };
