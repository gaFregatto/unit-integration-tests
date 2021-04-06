import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IAuthenticateUserResponseDTO } from "./IAuthenticateUserResponseDTO";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase:AuthenticateUserUseCase;
let inMemoryUserRepository:InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {

  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUserRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
  })

  it("Should be able to authenticate an user", async () => {
    const user: ICreateUserDTO = {
      name: "User",
      email: "user@test.com",
      password: "1234",
    };
    await createUserUseCase.execute(user);

    const result: IAuthenticateUserResponseDTO = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });
  
    expect(result).toHaveProperty("token");
  });

  it("Should not be able to authenticate an non existent user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "false@user.com.br",
        password: "1a2s3d",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate if password is incorrect", () => {
    expect(async () => {
      const user:ICreateUserDTO = await createUserUseCase.execute({
        name: "User",
        email: "user@error.com",
        password: "1234",
      });
      await authenticateUserUseCase.execute({
        email: user.email,
        password: "not the password"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
})