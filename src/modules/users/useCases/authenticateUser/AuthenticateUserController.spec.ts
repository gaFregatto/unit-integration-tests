import { app } from "../../../../app";
import request from "supertest";
import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
  
  it("Should be able to authenticate an user", async () => {
    await request(app).post("/api/v1/users")
    .send({
      name: "User test",
      email: "user@test.br",
      password: "password test"
    });
    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@test.br",
      password: "password test"
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("Should not be able to authenticate an non-existent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "non_existent@test.br",
      password: "default password"
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Incorrect email or password");
  });

  it("Should not be able to authenticate if password is incorrect", async () => {
    await request(app).post("/api/v1/users")
    .send({
      name: "User test",
      email: "user@test.br",
      password: "password test"
    });
    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@test.b",
      password: "wrong password"
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Incorrect email or password");
  });
});