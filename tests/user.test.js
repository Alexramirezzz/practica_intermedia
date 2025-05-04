const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

require("dotenv").config();

const testUser = {
  email: "test@example.com",
  password: "test1234",
  name: "Test",
  surnames: "User",
  nif: "12345678Z"
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("API de Usuario", () => {
  test("Debería registrar un usuario", async () => {
    const res = await request(app)
      .post("/api/auth/user/register")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(testUser.email);
  });

  test("Debería permitir hacer login con usuario registrado", async () => {
    await request(app).post("/api/auth/user/register").send(testUser);

    const res = await request(app)
      .post("/api/auth/user/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(testUser.email);
  });

  test("Debería acceder a la información de usuario protegida", async () => {
    await request(app).post("/api/auth/user/register").send(testUser);
    const login = await request(app).post("/api/auth/user/login").send({
      email: testUser.email,
      password: testUser.password
    });

    const token = login.body.token;

    const res = await request(app)
      .get("/api/auth/user")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  test("Debería actualizar la información personal del usuario", async () => {
    await request(app).post("/api/auth/user/register").send(testUser);
    const login = await request(app).post("/api/auth/user/login").send({
      email: testUser.email,
      password: testUser.password
    });

    const token = login.body.token;

    const res = await request(app)
      .put("/api/auth/user")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Nuevo Nombre",
        surnames: "Nuevo Apellido",
        nif: "87654321X"
      });

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("Nuevo Nombre");
    expect(res.body.user.surnames).toBe("Nuevo Apellido");
    expect(res.body.user.nif).toBe("87654321X");
  });

  test("Debería actualizar si el usuario es autónomo", async () => {
    await request(app).post("/api/auth/user/register").send(testUser);
    const login = await request(app).post("/api/auth/user/login").send({
      email: testUser.email,
      password: testUser.password
    });

    const token = login.body.token;

    const res = await request(app)
      .patch("/api/auth/user/autonomo")
      .set("Authorization", `Bearer ${token}`)
      .send({
        isAutonomo: true
      });

    expect(res.status).toBe(200);
    expect(res.body.user.isAutonomo).toBe(true);
  });
});
