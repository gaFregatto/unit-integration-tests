import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

import {OperationType} from "./CreateStatementController"

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;


describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });
  
  it("Should be able to create a new statement", async () => {
    const user = await createUserUseCase.execute({
      name: "User test",
      email: "user@test.com.br",
      password: "1234",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit test"
    });

    expect(statement).toHaveProperty("id");
  });

  it("Should not be able to create statement if user does not exists", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "non-existent user",
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Deposit test"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to withdraw when insufficient funds", () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User test",
        email: "user@test.com.br",
        password: "1234",
      });
      
      await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "Insufficient funds test"
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })
})