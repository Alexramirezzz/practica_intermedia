const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Errores de API de Usuarios", () => {
    it("No debería permitir registro con email inválido", async () => {
      const res = await request(app)
        .post("/api/auth/user/register")
        .send({ email: "invalido", password: "12345678" });
  
      expect(res.status).toBe(400);
    });
  
    it("No debería verificar un código inválido", async () => {
      const res = await request(app)
        .put("/api/auth/user/validation")
        .set("Authorization", "Bearer token_falso")
        .send({ code: "000000" });
  
      // Tu API devuelve 403 para código inválido
      expect(res.status).toBe(403);
    });
  
    it("No debería permitir login con contraseña incorrecta", async () => {
      const email = `testuser${Date.now()}@test.com`;
      await request(app)
        .post("/api/auth/user/register")
        .send({ email, password: "correcta123" });
  
      const res = await request(app)
        .post("/api/auth/user/login")
        .send({ email, password: "incorrecta" });
  
      // Tu API devuelve 404 si no encuentra usuario o no valida
      expect([401, 404]).toContain(res.status);
    });
  
    it("No debería permitir obtener usuario sin token", async () => {
      const res = await request(app).get("/api/auth/user");
      expect(res.status).toBe(401);
    });
  
    it("No debería permitir eliminar usuario con token inválido", async () => {
      const res = await request(app)
        .delete("/api/auth/user")
        .set("Authorization", "Bearer token_invalido");
  
      // Tu middleware devuelve 403 por token inválido
      expect(res.status).toBe(403);
    });
  
    it("No debería permitir iniciar recuperación con email no registrado", async () => {
      const res = await request(app)
        .post("/api/auth/user/recover")
        .send({ email: "notfound@test.com" });
  
      // Tu API devuelve 404 si el email no existe
      expect(res.status).toBe(404);
    });
  
    it("No debería permitir confirmar nueva contraseña con token inválido", async () => {
      const res = await request(app)
        .post("/api/auth/user/recover/confirm")
        .send({ token: "invalido", newPassword: "12345678" });
  
      // Tu API devuelve 404 si el token es inválido
      expect(res.status).toBe(404);
    });
  });