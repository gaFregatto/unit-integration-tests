import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

let createUserUseCase:CreateUserUseCase;
let inMemoryUsersRepository:InMemoryUsersRepository;

describe("Create User", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it("Should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "User test",
      email: "user@test.com.br",
      password: "1234",
    });
    expect(user).toHaveProperty("id");
  });

  it("Should not be able to create user if email is already being used", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User1",
        email: "user@test.com.br",
        password: "1234",
      });
      await createUserUseCase.execute({
        name: "User2",
        email: "user@test.com.br",
        password: "4321",
      });
    }).rejects.toBeInstanceOf(CreateUserError)
  })
})