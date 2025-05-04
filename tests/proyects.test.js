const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Client = require('../models/Clients');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let token;
let userId;
let clientId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  const testEmail = `projectuser${Date.now()}@test.com`;
  const hashedPassword = await bcrypt.hash('test1234', 10);

  const user = new User({
    email: testEmail,
    password: hashedPassword,
    verified: true
  });
  await user.save();
  userId = user._id;

  token = jwt.sign({ id: userId, email: testEmail }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  const client = await Client.create({
    name: 'Cliente para Proyecto',
    email: `client${Date.now()}@test.com`,
    address: {
      street: 'Calle Proyecto',
      city: 'Madrid',
      postalCode: '28001',
      province: 'Madrid',
    },
    createdBy: userId,
  });

  clientId = client._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('API de Proyectos', () => {
  it('Debería crear un proyecto', async () => {
    const response = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto de Test',
        description: 'Este es un proyecto de prueba',
        clientId,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('project');
    expect(response.body.project.name).toBe('Proyecto de Test');
  });

  it('Debería obtener todos los proyectos', async () => {
    const response = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.projects)).toBe(true);
  });

  it('Debería obtener un proyecto por ID', async () => {
    const createRes = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto para obtener',
        description: 'Descripción',
        clientId,
      });

    const projectId = createRes.body.project._id;

    const res = await request(app)
      .get(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.project.name).toBe('Proyecto para obtener');
  });

  it('Debería actualizar un proyecto', async () => {
    const createRes = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto Original',
        description: 'Descripción original',
        clientId,
      });

    const projectId = createRes.body.project._id;

    const res = await request(app)
      .put(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto Actualizado',
        description: 'Descripción actualizada',
      });

    expect(res.status).toBe(200);
    expect(res.body.project.name).toBe('Proyecto Actualizado');
  });

  it('Debería archivar un proyecto', async () => {
    const createRes = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto Archivado',
        description: 'Descripción',
        clientId,
      });

    const projectId = createRes.body.project._id;

    const res = await request(app)
      .patch(`/api/project/${projectId}/archive`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Proyecto archivado correctamente');
  });

  it('Debería eliminar un proyecto', async () => {
    const createRes = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto para Eliminar',
        description: 'Descripción',
        clientId,
      });

    const projectId = createRes.body.project._id;

    const res = await request(app)
      .delete(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Proyecto eliminado correctamente');
  });
});
