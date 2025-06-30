const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Allow extra time for the in-memory MongoDB server to start
jest.setTimeout(30000);

const Team = require('../models/Team');
const User = require('../models/User');

let mongoServer;
let app;
let team;
let leader;

beforeAll(async () => {
  // Launch an in-memory MongoDB instance for isolation
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'testsecret';

  // Require the app after setting env vars so it connects to the in-memory DB
  app = require('../server');
  await new Promise(resolve => mongoose.connection.once('open', resolve));

  // Seed a team and its leader
  team = await Team.create({
    name: 'Alpha',
    password: 'pass',
    photoUrl: 'team.jpg',
    members: []
  });
  leader = await User.create({
    name: 'Alice Smith',
    firstName: 'Alice',
    lastName: 'Smith',
    photoUrl: 'alice.jpg',
    team: team._id,
    isAdmin: true
  });
  team.leader = leader._id;
  team.members.push({ name: leader.name, avatarUrl: leader.photoUrl });
  await team.save();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('/api/onboard', () => {
  test('joins existing team regardless of leader name casing', async () => {
    const res = await request(app)
      .post('/api/onboard')
      .field('firstName', 'Bob')
      .field('lastName', 'Jones')
      .field('isNewTeam', 'false')
      .field('leaderLastName', 'sMiTh') // mixed case on purpose
      .attach('selfie', Buffer.from('fake'), 'selfie.jpg');

    expect(res.statusCode).toBe(201);

    const created = await User.findOne({ firstName: 'Bob', lastName: 'Jones' });
    expect(created).toBeTruthy();
    expect(created.team.toString()).toBe(team._id.toString());
  });
});
