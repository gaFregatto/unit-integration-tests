import { app } from "../../../../app";
import request from "supertest";
import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
  
  it("Should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users")
    .send({
      name: "User test",
      email: "user@test.br",
      password: "password test"
    });
    expect(response.status).toBe(201);
  });

  it("Should not be able to create user if email is already being used", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User test",
      email: "user@test.br",
      password: "password test"
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "User test2",
      email: "user@test.br",
      password: "password test"
    }); 
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already exists');
  });
});