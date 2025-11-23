const { getAuthConfig, handleDiscordAuth } = require('../../src/routes/authController');
const axios = require('axios');
const admin = require('firebase-admin');

// Mock axios
jest.mock('axios');

// Mock firebase-admin
const mockCreateCustomToken = jest.fn();
jest.mock('firebase-admin', () => {
  const firestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
  };
  return {
    /**
     * @returns {object} mockCreateCustomToken
     */
    auth: () => ({
      createCustomToken: mockCreateCustomToken,
    }),
    /**
     * @returns {object} firestore object
     */
    firestore: () => firestore,
  };
});

describe('getAuthConfig', () => {
  it('should return the Discord client ID', () => {
    process.env.DISCORD_CLIENT_ID = 'test-client-id';

    const req = {};
    const res = {
      json: jest.fn(),
    };

    getAuthConfig(req, res);

    expect(res.json).toHaveBeenCalledWith({ clientId: 'test-client-id' });
  });

  it('should return a 500 error if the client ID is not configured', () => {
    delete process.env.DISCORD_CLIENT_ID;

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    getAuthConfig(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Server configuration error.');
  });

  it('should handle errors when retrieving the client ID', () => {
    process.env.DISCORD_CLIENT_ID = 'test-client-id';

    const req = {};
    const res = {
      json: jest.fn(() => {
        throw new Error('Test error');
      }),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    getAuthConfig(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Server configuration error.');
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

describe('handleDiscordAuth', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a 400 error if the code is missing', async () => {
    const req = { body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await handleDiscordAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Missing Discord authorization code.');
  });

  it('should return a firebase token on successful authentication', async () => {
    const req = {
      body: { code: 'test-code' },
      headers: { origin: 'http://localhost:3000' },
    };
    const res = {
      json: jest.fn(),
    };

    axios.post.mockResolvedValue({ data: { access_token: 'test-access-token' } });
    axios.get.mockResolvedValue({
      data: { id: 'test-discord-id', username: 'test-user', global_name: 'Test User', avatar: 'test-avatar' },
    });
    mockCreateCustomToken.mockResolvedValue('test-firebase-token');
    admin.firestore().get.mockResolvedValue({ exists: false });

    await handleDiscordAuth(req, res);

    expect(res.json).toHaveBeenCalledWith({ firebaseToken: 'test-firebase-token' });
    expect(admin.firestore().set).toHaveBeenCalledWith({
      global_name: 'Test User',
      discordId: 'test-discord-id',
      username: 'test-user',
      avatar: 'test-avatar',
      role: 'client',
    });
  });

  it('should update the user if the user already exists', async () => {
    const req = {
      body: { code: 'test-code' },
      headers: { origin: 'http://localhost:3000' },
    };
    const res = {
      json: jest.fn(),
    };

    axios.post.mockResolvedValue({ data: { access_token: 'test-access-token' } });
    axios.get.mockResolvedValue({
      data: { id: 'test-discord-id', username: 'test-user', global_name: 'Test User', avatar: 'test-avatar' },
    });
    mockCreateCustomToken.mockResolvedValue('test-firebase-token');
    admin.firestore().get.mockResolvedValue({ exists: true });

    await handleDiscordAuth(req, res);

    expect(res.json).toHaveBeenCalledWith({ firebaseToken: 'test-firebase-token' });
    expect(admin.firestore().update).toHaveBeenCalledWith({
      global_name: 'Test User',
      username: 'test-user',
      avatar: 'test-avatar',
    });
  });

  it('should return a 500 error if authentication fails', async () => {
    const req = {
      body: { code: 'test-code' },
      headers: { origin: 'http://localhost:3000' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    axios.post.mockRejectedValue(new Error('Test error'));

    await handleDiscordAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Authentication failed.');
  });
});
