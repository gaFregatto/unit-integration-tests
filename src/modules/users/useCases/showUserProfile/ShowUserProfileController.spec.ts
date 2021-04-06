import { app } from "../../../../app";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { query } from "express";

let connection: Connection;
let token: string;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    
    await request(app).post("/api/v1/users")
    .send({
      name: "User test",
      email: "user@test.br",
      password: "password test"
    });
    const session = await request(app).post("/api/v1/sessions").send({
      email: "user@test.br",
      password: "password test"
    });
    token = session.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
  
  it("Should be able to show user profile if authenticated with JWT token", async () => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("Should not be able to show user profile if JWT token is missing", async () => {
    const response = await request(app).get("/api/v1/profile");
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT token is missing!");
  });

  it("Should not be able to show user profile if JWT token is invalid", async () => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer 89127847862143`
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("JWT invalid token!");
  });

  it("Should not be able to show user profile if user does not exist", async () => {
    await connection.query(`DELETE FROM users WHERE email='user@test.br'`);
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`
    });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });
});