const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  // Crear usuario de prueba
  const email = `errorcliente${Date.now()}@test.com`;
  const password = await bcrypt.hash("test1234", 10);
  const user = new User({ email, password, verified: true });
  await user.save();

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Errores de API de Clientes", () => {
  it("No debería permitir crear cliente sin token", async () => {
    const res = await request(app)
      .post("/api/client")
      .send({
        name: "Cliente sin token",
        email: "invalid@test.com",
        address: {
          street: "Sin Calle",
          city: "Ciudad",
          postalCode: "00000",
          province: "Provincia"
        }
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token no proporcionado/i);
  });

  it("No debería permitir crear cliente con datos inválidos", async () => {
    const res = await request(app)
      .post("/api/client")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "",
        email: "no-email",
        address: {} // vacío
      });

    expect(res.status).toBe(400); // Error de validación
  });

  it("No debería obtener cliente con ID inválido", async () => {
    const res = await request(app)
      .get("/api/client/invalidid123")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/id de cliente no válido/i);
  });

  it("No debería actualizar cliente inexistente", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/client/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Nuevo nombre" });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/no encontrado/i);
  });

  it("No debería archivar cliente inexistente", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .patch(`/api/client/${fakeId}/archive`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("No debería eliminar cliente inexistente", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/client/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("No debería recuperar cliente inexistente", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .patch(`/api/client/${fakeId}/recover`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
