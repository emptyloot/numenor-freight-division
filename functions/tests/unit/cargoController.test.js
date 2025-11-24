const { getCargo } = require('../../src/routes/cargoController');
const admin = require('firebase-admin');
const axios = require('axios');

// Mock firebase-admin
jest.mock('firebase-admin', () => {
  const firestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn(),
  };
  return {
    /**
     * @returns {object} mocked firestore initialization
     */
    firestore: () => firestore,
    initializeApp: jest.fn(),
  };
});

// Mock axios
jest.mock('axios');

describe('getCargo', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should return cached cargo if it exists and is not stale', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const cacheDoc = {
      exists: true,
      /**
       * @returns {object} mock data
       */
      data: () => ({
        cargo: [{ id: 1, name: 'Test Cargo' }],
        timestamp: {
          /**
           * @returns {object} mock toDate
           */
          toDate: () => new Date(Date.now() - 1000), // 1 second ago
        },
      }),
    };

    admin.firestore().get.mockResolvedValue(cacheDoc);

    await getCargo(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      cargo: [{ id: 1, name: 'Test Cargo' }],
      count: 1,
    });
  });

  it('should fetch new cargo if cache is empty', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    admin.firestore().get.mockResolvedValue({ exists: false });
    axios.get.mockResolvedValue({ data: { cargos: [{ id: 2, name: 'New Cargo' }] } }); //eslint-disable-line

    await getCargo(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      cargo: [{ id: 2, name: 'New Cargo' }],
      count: 1,
    });
    expect(admin.firestore().set).toHaveBeenCalled();
  });

  it('should return a 500 error if fetching new cargo fails and cache is empty', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    admin.firestore().get.mockResolvedValue({ exists: false });
    axios.get.mockRejectedValue(new Error('API Error'));

    await getCargo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch initial cargo data.' });
    jest.restoreAllMocks();
  });

  it('should return 500 and log error if fetched cargo data is not an array and cache is empty', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    admin.firestore().get.mockResolvedValue({ exists: false });
    axios.get.mockResolvedValue({ data: { cargos: 'not an array' } }); //eslint-disable-line

    await getCargo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch initial cargo data.' });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching cargo from external API:',
      'Cargo API did not return a valid array.'
    );
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should fetch new cargo in background if cache is stale', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const staleCacheDoc = {
      exists: true,
      /**
       * @returns {object} data
       */
      data: () => ({
        cargo: [{ id: 1, name: 'Stale Cargo' }],
        timestamp: {
          /**
           * @returns {object} toDate
           */
          toDate: () => new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        },
      }),
    };
    admin.firestore().get.mockResolvedValue(staleCacheDoc);
    axios.get.mockResolvedValue({ data: { cargos: [{ id: 2, name: 'New Cargo' }] } }); //eslint-disable-line

    await getCargo(req, res);

    expect(res.json).toHaveBeenCalledWith({ cargo: [{ id: 1, name: 'Stale Cargo' }], count: 1 });

    // Give the event loop a chance to run the background fetch
    await new Promise((resolve) => setImmediate(resolve));

    expect(axios.get).toHaveBeenCalled();
  });

  it('should return a 500 error if there is an error getting the cache', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    admin.firestore().get.mockRejectedValue(new Error('Firestore error'));

    await getCargo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch cargo data.', error: 'Firestore error' });
  });
});
