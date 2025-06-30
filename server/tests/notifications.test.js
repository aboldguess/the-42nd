const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Integration tests spin up an in-memory MongoDB which can take a few seconds
jest.setTimeout(30000);

const Notification = require('../models/Notification');
const User = require('../models/User');
const Team = require('../models/Team');
const { createNotification } = require('../utils/notifications');

let mongoServer;
let app;
let user1;
let user2;
let team;
let token1;
let token2;
let personalNote;
let teamNote;

beforeAll(async () => {
  // Spin up an in-memory MongoDB instance so tests run without a real database
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'testsecret';

  // Require the Express app after setting env vars so it connects to the
  // in-memory database. server.js exports the app without starting the server.
  app = require('../server');

  // Wait for Mongoose to finish the initial connection
  await new Promise(resolve => mongoose.connection.once('open', resolve));

  // Create a team and two users for testing
  team = await Team.create({
    name: 'Team',
    password: 'pass',
    photoUrl: 'team.jpg',
    members: []
  });
  user1 = await User.create({
    name: 'User One',
    firstName: 'User',
    lastName: 'One',
    photoUrl: 'one.jpg',
    team: team._id
  });
  user2 = await User.create({
    name: 'User Two',
    firstName: 'User',
    lastName: 'Two',
    photoUrl: 'two.jpg',
    team: team._id
  });

  // JWTs used to authenticate requests
  token1 = jwt.sign({ id: user1._id }, process.env.JWT_SECRET);
  token2 = jwt.sign({ id: user2._id }, process.env.JWT_SECRET);

  // Seed a few notifications for the integration tests
  personalNote = await createNotification({
    user: user2._id,
    actor: user1,
    message: 'Hello User2'
  });
  teamNote = await createNotification({
    team: team._id,
    actor: user1,
    message: 'Team message'
  });
  // Additional note that should not show up for user2
  await createNotification({ user: user1._id, actor: user2, message: 'Ignore' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ----- Unit tests for createNotification helper -----
describe('createNotification', () => {
  test('creates a notification for a user', async () => {
    const note = await createNotification({
      user: user1._id,
      actor: user2,
      message: 'Test message'
    });
    expect(note).toBeTruthy();
    // Newly created note should reference the correct actor model
    expect(note.actorModel).toBe('User');
    expect(note.user.toString()).toBe(user1._id.toString());
  });

  test('creates a system notification when no actor provided', async () => {
    const note = await createNotification({
      user: user1._id,
      message: 'System message'
    });
    expect(note).toBeTruthy();
    expect(note.actor).toBeUndefined();
    expect(note.actorModel).toBe('System');
  });

  test('returns null when actor is invalid', async () => {
    const bad = await createNotification({ user: user1._id, actor: {}, message: 'Bad' });
    expect(bad).toBeNull();
  });
});

// ----- Integration tests for /api/notifications endpoints -----
describe('/api/notifications endpoints', () => {
  test('GET /api/notifications returns personal and team notes', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token2}`);

    expect(res.statusCode).toBe(200);
    // Expect the team and personal notifications for user2
    const ids = res.body.map(n => n._id.toString());
    expect(ids).toEqual(
      expect.arrayContaining([personalNote._id.toString(), teamNote._id.toString()])
    );
  });

  test('GET /api/notifications/team filters to team only', async () => {
    const res = await request(app)
      .get('/api/notifications/team')
      .set('Authorization', `Bearer ${token2}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]._id.toString()).toBe(teamNote._id.toString());
  });

  test('PUT /api/notifications/:id/read marks as read', async () => {
    const res = await request(app)
      .put(`/api/notifications/${personalNote._id}/read`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.statusCode).toBe(200);
    const updated = await Notification.findById(personalNote._id);
    expect(updated.read).toBe(true);
  });

  test('PUT /api/notifications/:id/read blocks other users', async () => {
    const res = await request(app)
      .put(`/api/notifications/${personalNote._id}/read`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toBe(403);
  });
});
