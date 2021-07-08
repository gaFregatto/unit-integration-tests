import { app } from "../../../../app";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { User } from "@modules/users/entities/User";

import {OperationType} from "./CreateStatementController"

let connection: Connection;
let token: string;
let user: User;

describe("Create Statement Controller", () => {
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
  
  it("Should be able to create a deposit statement", async () => {
    const res = await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "Deposit statement test"
    }).set({
      Authorization: `Bearer ${token}`
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.user_id).toBe(user.id);
    expect(res.body).toHaveProperty("type");
    expect(res.body.type).toBe("deposit");
  });

  it("Should be able to create a withdraw statement", async () => {
    const res = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 100,
      description: "Withdraw statement test"
    }).set({
      Authorization: `Bearer ${token}`
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.user_id).toBe(user.id);
    expect(res.body).toHaveProperty("type");
    expect(res.body.type).toBe("withdraw");
  });
  
  it("Should be able to create s transfer statement", async () => {
    const res = await request(app).post("api/v1/statements/transfer/:receiver_id").send({
      amount: 100,
      description: "Transfer statement"
    }).set({
      Authorization: `Bearer ${token}`
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("type");
    expect(res.body.type).toBe("transfer");
  })

  it("Should not be able to create a withdraw statement when funds are insufficient", async () => {
    const res = await request(app).post('/api/v1/statements/withdraw')
    .send({
      amount: 100,
      description: 'Withdraw test',
    })
    .set({
      Authorization: `Bearer ${token}`,
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Insufficient funds');
  });

  it("Should not be able to create create statement with invalid JWT token", async () => {
    const res = await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "Deposit statement test"
    }).set({
      Authorization: `Bearer 31233541324`
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("JWT invalid token!");
  });

  it("Should not be able to create statement with JWT token missing", async () => {
    const res = await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "Deposit statement test"
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("JWT token is missing!");
  });

  it("Should not be able to create statement when user does not exists", async () => {
    await connection.query(`DELETE FROM users WHERE email='user@test.br'`);
    const res = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });
});