const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Client = require("../models/Clients");
const Project = require("../models/Project");
const DeliveryNote = require("../models/DeliveryNote");

let token, userId, clientId, projectId, deliveryNoteId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  const email = `testerror${Date.now()}@test.com`;
  const password = await bcrypt.hash("test1234", 10);
  const user = new User({ email, password, verified: true });
  await user.save();
  userId = user._id;

  token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

  const client = new Client({
    name: "Cliente Test",
    email: `cliente${Date.now()}@test.com`,
    address: { street: "Calle", city: "Ciudad", postalCode: "0000", province: "Provincia" },
    createdBy: userId,
  });
  await client.save();
  clientId = client._id;

  const project = new Project({
    name: "Proyecto Test",
    description: "Descripción",
    clientId,
    createdBy: userId,
  });
  await project.save();
  projectId = project._id;

  const note = new DeliveryNote({
    projectId,
    userId,
    clientId,
    type: "hours",
    content: [{ person: "Juan", hoursWorked: 2, description: "Trabajo" }],
  });
  await note.save();
  deliveryNoteId = note._id;

  note.signed = true;
  await note.save();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Errores de API de Albaranes", () => {
  it("No debería permitir crear albarán sin token", async () => {
    const res = await request(app).post("/api/deliverynote").send({});
    expect(res.status).toBe(401);
  });

  it("No debería encontrar un albarán inexistente por ID", async () => {
    const res = await request(app)
      .get("/api/deliverynote/64b0c2f3f8c2a81984ef1234")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("No debería generar PDF de albarán inexistente", async () => {
    const res = await request(app)
      .get("/api/deliverynote/pdf/64b0c2f3f8c2a81984ef1234")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("No debería firmar albarán sin archivo de firma", async () => {
    const res = await request(app)
      .patch(`/api/deliverynote/${deliveryNoteId}/sign`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("No debería firmar un albarán inexistente", async () => {
    const res = await request(app)
      .patch("/api/deliverynote/64b0c2f3f8c2a81984ef1234/sign")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("No debería eliminar un albarán firmado", async () => {
    const res = await request(app)
      .delete(`/api/deliverynote/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no se puede eliminar/i);
  });

  it("No debería eliminar un albarán inexistente", async () => {
    const res = await request(app)
      .delete("/api/deliverynote/64b0c2f3f8c2a81984ef1234")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});