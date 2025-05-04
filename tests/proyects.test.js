const request = require('supertest');
const app = require('../app'); // Asegúrate de que este sea el archivo donde se configura tu app Express.
const mongoose = require('mongoose');

let token;

beforeAll(async () => {
  // Conectar a la base de datos de test antes de que empiecen los tests
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Crear un usuario y obtener el token
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'testuser@example.com',
      password: 'mypassword123',
    });

  token = res.body.token; // Asumimos que el token se encuentra en `res.body.token`
  console.log('Token de prueba:', token); // Verificar que el token se ha generado correctamente
});

afterAll(async () => {
  // Desconectar de la base de datos después de que se completen los tests
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
        clientId: 'client_id_example', // Asegúrate de que este clientId sea válido
        createdBy: 'user_id_example',  // Asegúrate de que este userId sea válido
      });

    console.log('Respuesta de la creación del proyecto:', response.body); // Verifica la respuesta

    expect(response.status).toBe(201);  // 201 para creación exitosa
    expect(response.body).toHaveProperty('project');
    expect(response.body.project.name).toBe('Proyecto de Test');
  });

  it('Debería obtener todos los proyectos', async () => {
    const response = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.projects)).toBe(true); // Comprobamos que la respuesta sea un array
  });

  it('Debería obtener un proyecto por ID', async () => {
    const createResponse = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto de Test',
        description: 'Este es un proyecto de prueba',
        clientId: 'client_id_example',
        createdBy: 'user_id_example',
      });

    // Verifica que la respuesta contiene un proyecto y su ID
    expect(createResponse.body).toHaveProperty('project');
    const projectId = createResponse.body.project._id;
    console.log('ID del proyecto creado:', projectId);  // Verificar que el ID es correcto

    const response = await request(app)
      .get(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.project).toHaveProperty('name');
    expect(response.body.project.name).toBe('Proyecto de Test');
  });

  it('Debería actualizar un proyecto', async () => {
    const createResponse = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto de Test',
        description: 'Este es un proyecto de prueba',
        clientId: 'client_id_example',
        createdBy: 'user_id_example',
      });

    const projectId = createResponse.body.project._id;
    console.log('ID del proyecto a actualizar:', projectId);  // Verificar que el ID es correcto

    const response = await request(app)
      .put(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto Actualizado',
        description: 'Este es un proyecto actualizado',
      });

    expect(response.status).toBe(200);
    expect(response.body.project.name).toBe('Proyecto Actualizado');
  });

  it('Debería archivar un proyecto', async () => {
    const createResponse = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto de Test',
        description: 'Este es un proyecto de prueba',
        clientId: 'client_id_example',
        createdBy: 'user_id_example',
      });

    const projectId = createResponse.body.project._id;

    const response = await request(app)
      .patch(`/api/project/${projectId}/archive`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Proyecto archivado correctamente');
  });

  it('Debería eliminar un proyecto', async () => {
    const createResponse = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto de Test',
        description: 'Este es un proyecto de prueba',
        clientId: 'client_id_example',
        createdBy: 'user_id_example',
      });

    const projectId = createResponse.body.project._id;

    const response = await request(app)
      .delete(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Proyecto eliminado correctamente');
  });
});
