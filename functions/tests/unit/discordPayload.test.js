const { createShipmentPayload } = require('../../src/utils/discordPayload');

describe('createShipmentPayload', () => {
  it('should create a valid Discord payload for a new shipment', () => {
    const documentId = 'test-shipment-123';
    const shipmentData = {
      client: 'Test Client Inc.',
      port: [
        { name: 'Port A' },
        { name: 'Port B' },
      ],
      cargo: [
        { quantity: 100, name: 'Widgets' },
        { quantity: 50, name: 'Gadgets' },
      ],
    };

    const payload = createShipmentPayload(documentId, shipmentData);

    // Check top-level properties
    expect(payload).toHaveProperty('content', documentId);
    expect(payload).toHaveProperty('embeds');
    expect(Array.isArray(payload.embeds)).toBe(true);
    expect(payload.embeds).toHaveLength(1);

    // Check the embed object
    const embed = payload.embeds[0];
    expect(embed).toHaveProperty('title', 'New Shipment Created');
    expect(embed).toHaveProperty('description', 'A new shipment for client Test Client Inc. has been added to the system.');
    expect(embed).toHaveProperty('color', 5814783);
    expect(embed).toHaveProperty('timestamp');
    // Check if timestamp is a valid ISO 8601 date string
    const isISODateString = (s) => new Date(s).toISOString() === s;
    expect(isISODateString(embed.timestamp)).toBe(true);


    // Check the fields
    expect(embed).toHaveProperty('fields');
    expect(Array.isArray(embed.fields)).toBe(true);
    expect(embed.fields).toHaveLength(3);

    const [originField, destinationField, cargoField] = embed.fields;

    expect(originField).toEqual({
      name: 'Origin',
      value: 'Port A',
      inline: true,
    });

    expect(destinationField).toEqual({
      name: 'Destination',
      value: 'Port B',
      inline: true,
    });

    expect(cargoField).toEqual({
      name: 'Cargo',
      value: '**100** x Widgets\n**50** x Gadgets',
      inline: false,
    });
  });

  it('should handle missing port names and empty cargo', () => {
    const documentId = 'test-shipment-456';
    const shipmentData = {
      client: 'Another Client',
      port: [
        {},
        {}
      ],
      cargo: [],
    };

    const payload = createShipmentPayload(documentId, shipmentData);
    const embed = payload.embeds[0];
    const [originField, destinationField, cargoField] = embed.fields;

    expect(originField.value).toBe('N/A');
    expect(destinationField.value).toBe('N/A');
    expect(cargoField.value).toBe('N/A');
  });
});
