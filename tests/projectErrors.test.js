const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let token, userId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  const email = `errorproject${Date.now()}@test.com`;
  const password = await bcrypt.hash("test1234", 10);
  const user = new User({ email, password, verified: true });
  await user.save();
  userId = user._id;

  token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Errores de API de Proyectos", () => {
  it("No debería permitir crear proyecto sin token", async () => {
    const res = await request(app).post("/api/project").send({
      name: "Proyecto",
      description: "Prueba",
      clientId: new mongoose.Types.ObjectId(),
    });

    expect(res.status).toBe(401);
  });

  it("No debería permitir crear proyecto con clientId inválido", async () => {
    const res = await request(app)
      .post("/api/project")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Proyecto inválido",
        description: "No válido",
        clientId: "id_no_valido",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/id/i);
  });

  it("No debería encontrar un proyecto con ID inexistente", async () => {
    const idInexistente = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/project/${idInexistente}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("No debería permitir actualizar proyecto con ID inválido", async () => {
    const res = await request(app)
      .put("/api/project/idinvalido")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Nuevo nombre" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/id de proyecto no válido/i);
  });

  it("No debería permitir archivar proyecto inexistente", async () => {
    const res = await request(app)
      .patch(`/api/project/${new mongoose.Types.ObjectId()}/archive`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("No debería permitir eliminar proyecto inexistente", async () => {
    const res = await request(app)
      .delete(`/api/project/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("No debería permitir restaurar proyecto inexistente", async () => {
    const res = await request(app)
      .patch(`/api/project/restore/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
