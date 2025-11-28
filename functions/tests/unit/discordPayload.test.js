const { createShipmentPayload } = require('../../src/utils/discordPayload');

describe('createShipmentPayload', () => {
  it('should create a valid Discord payload for an unassigned shipment', () => {
    const documentId = 'test-shipment-123';
    const shipmentData = {
      client: 'Test Client Inc.',
      port: [
        { name: 'Port A', north: 123, east: 456 },
        { name: 'Port B', north: 789, east: 101 },
      ],
      cargo: [
        { quantity: 100, name: 'Widgets' },
        { quantity: 50, name: 'Gadgets' },
      ],
      status: 'pending',
    };

    const payload = createShipmentPayload(documentId, shipmentData);

    // Check top-level properties
    expect(payload).toHaveProperty('content', `New Logistics Order: ${documentId}`);
    expect(payload).toHaveProperty('embeds');
    expect(Array.isArray(payload.embeds)).toBe(true);
    expect(payload.embeds).toHaveLength(1);

    // Check the embed object
    const embed = payload.embeds[0];
    expect(embed).toHaveProperty('title', '🚛 Transport Work Order');
    expect(embed).toHaveProperty('description', 'Client **Test Client Inc.** requires transport.');
    expect(embed).toHaveProperty('color', 15105570); // Orange for unassigned
    expect(embed).toHaveProperty('timestamp');
    expect(embed).toHaveProperty('footer', {
      text: `System ID: ${documentId}`,
    });

    // Check the fields
    expect(embed).toHaveProperty('fields');
    expect(Array.isArray(embed.fields)).toBe(true);
    expect(embed.fields).toHaveLength(4);

    const [pickupField, dropOffField, assignmentField, manifestField] = embed.fields;

    expect(pickupField).toEqual({
      name: '📍 Pickup (Origin)',
      value: '**Port A**\n*(North: 123,East: 456)*',
      inline: true,
    });

    expect(dropOffField).toEqual({
      name: '🏁 Drop off (Destination)',
      value: '**Port B**\n*(North: 789,East: 101)*',
      inline: true,
    });

    expect(assignmentField).toEqual({
      name: '📋 Assignment Details',
      value: '**Status:** Pending\n**Driver:** **Unassigned**',
      inline: false,
    });

    expect(manifestField).toEqual({
      name: '📦 Cargo Manifest',
      value: '**100** x Widgets\n**50** x Gadgets',
      inline: false,
    });
  });

  it('should create a valid Discord payload for an assigned shipment', () => {
    const documentId = 'test-shipment-789';
    const shipmentData = {
      client: 'Assigned Corp',
      port: [
        { name: 'Port C', north: 111, east: 222 },
        { name: 'Port D', north: 333, east: 444 },
      ],
      cargo: [{ quantity: 10, name: 'Containers' }],
      status: 'in-progress',
      driverId: 'driver-007',
      driverName: 'James Bond',
    };

    const payload = createShipmentPayload(documentId, shipmentData);
    const embed = payload.embeds[0];

    // Check color and assignment field for assigned shipment
    expect(embed).toHaveProperty('color', 5814783); // Purple for assigned
    const assignmentField = embed.fields[2];
    expect(assignmentField).toEqual({
      name: '📋 Assignment Details',
      value: '**Status:** In-progress\n**Driver:** James Bond',
      inline: false,
    });
  });

  it('should handle missing data and empty cargo gracefully', () => {
    const documentId = 'test-shipment-456';
    const shipmentData = {
      client: 'Another Client',
      port: [null, {}], // Test null and empty object
      cargo: [],
      status: 'delivered',
    };

    const payload = createShipmentPayload(documentId, shipmentData);
    const embed = payload.embeds[0];
    const [pickupField, dropOffField, assignmentField, manifestField] = embed.fields;

    expect(pickupField.value).toBe('unknown');
    expect(dropOffField.value).toBe('**undefined**\n*(North: undefined,East: undefined)*');
    expect(manifestField.value).toBe('No Cargo Listed');
    expect(assignmentField.value).toBe('**Status:** Delivered\n**Driver:** **Unassigned**');
  });
});
