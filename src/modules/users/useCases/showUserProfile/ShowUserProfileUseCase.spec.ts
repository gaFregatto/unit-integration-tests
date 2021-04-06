import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { IAuthenticateUserResponseDTO } from "../authenticateUser/IAuthenticateUserResponseDTO";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUserRepository:InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase:AuthenticateUserUseCase;
let showUserProfileUseCase:ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUserRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUserRepository);
  })

  it("Should be able to show user profile", async () => {
    const user: ICreateUserDTO = {
      name: "User",
      email: "user@test.com",
      password: "1234",
    };
    await createUserUseCase.execute(user);

    const auth: IAuthenticateUserResponseDTO = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    const profile = await showUserProfileUseCase.execute(auth.user.id);
    expect(profile).toHaveProperty("id");
  });

  it("Should not be able to show user profile if not authenticated", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("random id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  })
})