const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require("../models/User");
const Client = require("../models/Clients");

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

beforeEach(async () => {
  await User.deleteMany({});
  await Client.deleteMany({});

  const testEmail = `clienteuser${Date.now()}@test.com`;

  const user = new User({
    email: testEmail,
    password: "test1234", // No la hasheamos, el pre('save') del modelo lo hace
    verified: true
  });

  await user.save();

  const res = await request(app).post("/api/auth/user/login").send({
    email: testEmail,
    password: "test1234"
  });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('API de Clientes', () => {
  it('Debería crear un cliente', async () => {
    const uniqueEmail = `cliente${Date.now()}@test.com`;
    const response = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente de Test',
        email: uniqueEmail,
        address: {
          street: 'Calle Falsa 123',
          city: 'Madrid',
          postalCode: '28001',
          province: 'Madrid',
        },
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('client');
    expect(response.body.client.name).toBe('Cliente de Test');
  });

  it('Debería obtener todos los clientes', async () => {
    const response = await request(app)
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.clients)).toBe(true);
  });

  it('Debería obtener un cliente por ID', async () => {
    const createResponse = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente de Test',
        email: `cliente${Date.now()}@test.com`,
        address: {
          street: 'Calle Falsa 123',
          city: 'Madrid',
          postalCode: '28001',
          province: 'Madrid',
        },
      });

    const clientId = createResponse.body.client._id;

    const response = await request(app)
      .get(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.client.name).toBe('Cliente de Test');
  });

  it('Debería actualizar un cliente', async () => {
    const createResponse = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente de Test',
        email: `cliente${Date.now()}@test.com`,
        address: {
          street: 'Calle Falsa 123',
          city: 'Madrid',
          postalCode: '28001',
          province: 'Madrid',
        },
      });

    const clientId = createResponse.body.client._id;

    const response = await request(app)
      .put(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Actualizado',
        email: `actualizado${Date.now()}@test.com`,
        address: {
          street: 'Calle Nueva 456',
          city: 'Madrid',
          postalCode: '28002',
          province: 'Madrid',
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.client.name).toBe('Cliente Actualizado');
  });

  it('Debería archivar un cliente', async () => {
    const createResponse = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente de Test',
        email: `cliente${Date.now()}@test.com`,
        address: {
          street: 'Calle Falsa 123',
          city: 'Madrid',
          postalCode: '28001',
          province: 'Madrid',
        },
      });

    const clientId = createResponse.body.client._id;

    const response = await request(app)
      .patch(`/api/client/${clientId}/archive`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it('Debería eliminar un cliente', async () => {
    const createResponse = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente de Eliminar',
        email: `eliminar${Date.now()}@test.com`,
        address: {
          street: 'Calle eliminada',
          city: 'Ciudad eliminada',
          postalCode: '11223',
          province: 'Provincia eliminada',
        },
      });

    const clientId = createResponse.body.client._id;

    const response = await request(app)
      .delete(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
