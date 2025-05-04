const request = require('supertest');
const app = require('../app'); // Asegúrate de que este sea el archivo donde se configura tu app Express.
const mongoose = require('mongoose');

let token;

beforeAll(async () => {
    // Conectar a la base de datos de test antes de que empiecen los tests
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  
    // Login para obtener el token
    const res = await request(app)
       .post('/api/auth/login')
       .send({
           email: 'testuser@example.com',
           password: 'mypassword123',
});

token = res.body.token; // Asegúrate de que el token esté disponible
});

afterAll(async () => {
  // Desconectar de la base de datos después de que se completen los tests
  await mongoose.connection.close();
});

describe('API de Clientes', () => {
    it('Debería crear un cliente', async () => {
        const uniqueEmail = `cliente${Date.now()}@test.com`; // Generar un email único basado en el timestamp
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
      
        expect(response.status).toBe(201);  // 201 para creación exitosa
        expect(response.body).toHaveProperty('client');
        expect(response.body.client.name).toBe('Cliente de Test');
      });
      

  it('Debería obtener todos los clientes', async () => {
    const response = await request(app)
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.clients)).toBe(true); // Comprobamos que la respuesta sea un array
  });

  it('Debería obtener un cliente por ID', async () => {
    const uniqueEmail = `cliente${Date.now()}@test.com`; // Generar un email único
    const createResponse = await request(app)
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
  
    const clientId = createResponse.body.client._id;
  
    const response = await request(app)
      .get(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);
  
    expect(response.status).toBe(200);
    expect(response.body.client).toHaveProperty('name');  // Accede a client y verifica su propiedad name
    expect(response.body.client.name).toBe('Cliente de Test');
  });
  
  

  it('Debería actualizar un cliente', async () => {
    const uniqueEmail = `clienteactualizado${Date.now()}@test.com`; // Generar un email único
    const createResponse = await request(app)
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
  
    const clientId = createResponse.body.client._id;
  
    const response = await request(app)
      .put(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Actualizado',
        email: `clienteactualizado${Date.now()}@test.com`,  // Asegúrate de que el email sea único
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
    const uniqueEmail = `cliente${Date.now()}@test.com`;
    const createResponse = await request(app)
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
  
    const clientId = createResponse.body.client._id;
  
    const response = await request(app)
      .patch(`/api/client/${clientId}/archive`)
      .set('Authorization', `Bearer ${token}`);
  
    expect(response.status).toBe(200);
  });
  

  it('Debería eliminar un cliente', async () => {
    // Primero crea un cliente para obtener su ID
    const createResponse = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente de Eliminar',
        email: 'clienteeliminar@test.com',
        address: {
          street: 'Calle eliminada',
          city: 'Ciudad eliminada',
          postalCode: '11223',
          province: 'Provincia eliminada',
        },
      });

    const clientId = createResponse.body.client._id;

    // Eliminar el cliente
    const response = await request(app)
      .delete(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});