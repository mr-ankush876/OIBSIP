const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('Authentication & Email Verification API', () => {
  const sampleUser = {
    name: 'Mario Rossi',
    email: 'mario@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    preferredLanguage: 'en',
  };

  test('POST /api/auth/register - Successfully registers user and creates verification token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    const savedUser = await User.findOne({ email: sampleUser.email }).select('+verificationToken +verificationExpires');
    expect(savedUser).toBeTruthy();
    expect(savedUser.isVerified).toBe(false);
    expect(savedUser.verificationToken).toBeTruthy();
  });

  test('POST /api/auth/register - Rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send(sampleUser);
    const res = await request(app).post('/api/auth/register').send(sampleUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register - Rejects mismatched passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...sampleUser, confirmPassword: 'DifferentPassword' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/verify-email - Activates account upon valid token', async () => {
    const user = new User({
      name: 'Luigi Mario',
      email: 'luigi@example.com',
      password: 'Password123!',
      role: 'CUSTOMER',
      isVerified: false,
    });
    const rawToken = user.generateVerificationToken();
    await user.save();

    const res = await request(app)
      .get(`/api/auth/verify-email?token=${rawToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.isVerified).toBe(true);
  });

  test('POST /api/auth/login - Prevents unverified users from authenticating', async () => {
    const user = new User({
      name: 'Toadstool',
      email: 'toad@example.com',
      password: 'Password123!',
      role: 'CUSTOMER',
      isVerified: false,
    });
    await user.save();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'toad@example.com', password: 'Password123!' });

    expect(res.statusCode).toBe(403);
    expect(res.body.requiresVerification).toBe(true);
  });

  test('POST /api/auth/login - Successfully logs in verified user and returns JWT token', async () => {
    const user = new User({
      name: 'Princess Peach',
      email: 'peach@example.com',
      password: 'Password123!',
      role: 'CUSTOMER',
      isVerified: true,
    });
    await user.save();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'peach@example.com', password: 'Password123!' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('peach@example.com');
  });
});
