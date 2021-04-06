import { app } from "../../../../app";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { User } from "@modules/users/entities/User";
import {v4 as uuid} from "uuid";

let connection: Connection;
let token: string;
let user: User;

describe("Get Statement Operation Controller", () => {
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
    user = session.body.user;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
  
  it("Should be able to get balance equals to 0 when user has no statements", async () => {
    const res = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${token}`
    });
    expect(res.status).toBe(200);
    expect(res.body.statement.length).toBe(0);
    expect(res.body.balance).toBe(0);
  });

  it("Should be able to get balance from user", async () => {
    await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "Deposit statement test"
    }).set({
      Authorization: `Bearer ${token}`
    });
    await request(app).post("/api/v1/statements/withdraw").send({
      amount: 20,
      description: "Deposit statement test"
    }).set({
      Authorization: `Bearer ${token}`
    });
    const res = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${token}`
    });
    expect(res.status).toBe(200);
    expect(res.body.statement.length).toBe(2);
    expect(res.body.balance).toBe(80);
  })

  it("Should not be able to get balance when user does not exists", async () => {
    await connection.query(`DELETE FROM users WHERE email='user@test.br'`);
    const res = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${token}`
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  it("Should not be able to get balance with invalid JWT token", async () => {
    const res = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer 31233541324`
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("JWT invalid token!");
  });

  it("Should not be able to get balance with missing JWT token", async () => {
    const res = await request(app).get("/api/v1/statements/balance");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("JWT token is missing!");
  });
});