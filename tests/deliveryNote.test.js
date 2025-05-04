const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const User = require("../models/User");
const Client = require("../models/Clients");
const Project = require("../models/Project");
const DeliveryNote = require("../models/DeliveryNote");

let token, userId, clientId, projectId, deliveryNoteId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  const email = `testalbaran${Date.now()}@test.com`;
  const password = await bcrypt.hash("test1234", 10);
  const user = new User({ email, password, verified: true });
  await user.save();
  userId = user._id;

  token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

  const client = new Client({
    name: "Cliente Albarán",
    email: `cliente${Date.now()}@test.com`,
    address: {
      street: "Calle Prueba",
      city: "Ciudad",
      postalCode: "12345",
      province: "Provincia",
    },
    createdBy: userId,
  });
  await client.save();
  clientId = client._id;

  const project = new Project({
    name: "Proyecto Albarán",
    description: "Proyecto de prueba",
    clientId,
    createdBy: userId,
  });
  await project.save();
  projectId = project._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("API de Albaranes", () => {
  it("Debería crear un albarán", async () => {
    const res = await request(app)
      .post("/api/deliverynote")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "hours",
        content: [{ person: "Juan", hoursWorked: 4, description: "Desarrollo" }],
        projectId,
        clientId,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("deliveryNote");
    deliveryNoteId = res.body.deliveryNote._id;
  });

  it("Debería obtener todos los albaranes", async () => {
    const res = await request(app)
      .get("/api/deliverynote")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.deliveryNotes)).toBe(true);
  });

  it("Debería obtener un albarán por ID", async () => {
    const res = await request(app)
      .get(`/api/deliverynote/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.deliveryNote._id).toBe(deliveryNoteId);
  });

  it("Debería generar el PDF del albarán", async () => {
    const res = await request(app)
      .get(`/api/deliverynote/pdf/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("pdfUrl");
  });

  it("Debería firmar un albarán", async () => {
    // Asegurarse de que el archivo existe
    const signaturePath = path.join(__dirname, "firma.png");
    if (!fs.existsSync(signaturePath)) {
      fs.writeFileSync(signaturePath, "FAKE_SIGNATURE_IMAGE");
    }

    const res = await request(app)
      .patch(`/api/deliverynote/${deliveryNoteId}/sign`)
      .set("Authorization", `Bearer ${token}`)
      .attach("signature", signaturePath);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("signatureUrl");
  });

  it("No debería eliminar un albarán ya firmado", async () => {
    const res = await request(app)
      .delete(`/api/deliverynote/${deliveryNoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no se puede eliminar/i);
  });

  it("Debería eliminar un albarán no firmado", async () => {
    const resCreate = await request(app)
      .post("/api/deliverynote")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "hours",
        content: [{ person: "Pedro", hoursWorked: 2, description: "Test" }],
        projectId,
        clientId,
      });

    const newNoteId = resCreate.body.deliveryNote._id;

    const resDelete = await request(app)
      .delete(`/api/deliverynote/${newNoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(resDelete.status).toBe(200);
    expect(resDelete.body.message).toBe("Albarán eliminado correctamente");
  });
});
