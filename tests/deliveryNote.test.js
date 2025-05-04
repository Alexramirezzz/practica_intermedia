const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Client = require('../models/Clients');

let token;
let clientId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  const email = `albaranuser${Date.now()}@test.com`;
  const password = "test1234";

  const user = new User({
    email,
    password: await require("bcryptjs").hash(password, 10),
    verified: true
  });

  await user.save();

  const res = await request(app)
    .post('/api/auth/user/login')
    .send({ email, password });

  token = res.body.token;

  const clientRes = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: "Cliente Albaran",
      email: `clientealbaran${Date.now()}@test.com`,
      address: {
        street: "Calle Albaran",
        city: "Madrid",
        postalCode: "28001",
        province: "Madrid"
      }
    });

  clientId = clientRes.body.client._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('API de Albaranes', () => {
  it('Debería crear un albarán de horas', async () => {
    const res = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'horas',
        clientId,
        concept: 'Consultoría técnica',
        hours: 8,
        rate: 50
      });

    expect(res.status).toBe(201);
    expect(res.body.deliverynote.type).toBe('horas');
  });

  it('Debería listar todos los albaranes', async () => {
    const res = await request(app)
      .get('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.deliverynotes)).toBe(true);
  });

  it('Debería obtener un albarán por ID', async () => {
    const createRes = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'horas',
        clientId,
        concept: 'Desarrollo',
        hours: 5,
        rate: 40
      });

    const noteId = createRes.body.deliverynote._id;

    const res = await request(app)
      .get(`/api/deliverynote/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.deliverynote._id).toBe(noteId);
  });

  it('Debería archivar un albarán (firmar)', async () => {
    const createRes = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'horas',
        clientId,
        concept: 'Auditoría',
        hours: 3,
        rate: 60
      });

    const noteId = createRes.body.deliverynote._id;

    const res = await request(app)
      .delete(`/api/deliverynote/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Albarán eliminado correctamente');
  });
});
