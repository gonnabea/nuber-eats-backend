import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtModule } from "src/jwt/jwt.module";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { UserService } from "./users.service"

const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn()
})

const mockJwtService = {
    sign: jest.fn(() => "signed-token-baby"),
    verify: jest.fn(),
}

const mockMailService = {
    sendVerificationEmail: jest.fn()
}

type mockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

describe("UserService", () => {

    let service: UserService;
    let usersRepository: mockRepository<User>
    let verificationsRepository: mockRepository<Verification>
    let mailService: MailService
    let jwtService: JwtService
    beforeEach(async () => {

        const module = await Test.createTestingModule({
            providers: [
                UserService, {
                    provide: getRepositoryToken(User), 
                    useValue: mockRepository()
                },
                {
                    provide: getRepositoryToken(Verification), 
                    useValue: mockRepository()
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService
                },
                {
                    provide: MailService,
                    useValue: mockMailService
                }
            ]
        }).compile()
        service = module.get<UserService>(UserService)
        usersRepository = module.get(getRepositoryToken(User))
        jwtService = module.get<JwtService>(JwtService)
        mailService = module.get<MailService>(MailService)
        verificationsRepository = module.get(getRepositoryToken(Verification))
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })

   describe('createAccount', () => {
    const createAccountArgs = {
        email:"",
        password:"",
        role:0
    }
    it("should fail if user exist", async() => {
       
       usersRepository.findOne.mockResolvedValue({
           id: 1,
           email: "jlhjjl"
       })
    const result = await service.createAccount(createAccountArgs)
    expect(result).toMatchObject({
           ok: false,
           error: "There is a user with that email already"
       })
    })
    it('should create a new user', async() => {

        usersRepository.findOne.mockResolvedValue(undefined)
        usersRepository.create.mockReturnValue(createAccountArgs)
        usersRepository.save.mockResolvedValue(createAccountArgs)
        verificationsRepository.create.mockReturnValue({
            user: createAccountArgs
        })
        verificationsRepository.save.mockResolvedValue({
            code: "code"
        })
        const result = await service.createAccount(createAccountArgs)
        expect(usersRepository.create).toHaveBeenCalledTimes(1)
        expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs)
        expect(usersRepository.save).toHaveBeenCalledTimes(1)
        expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs)
        expect(verificationsRepository.create).toHaveBeenCalledTimes(1)
        expect(verificationsRepository.create).toHaveBeenCalledWith({user:createAccountArgs})

        expect(verificationsRepository.save).toHaveBeenCalledTimes(1)
        expect(verificationsRepository.save).toHaveBeenCalledWith({
            user: createAccountArgs
        })
        expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1)
        expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(expect.any(String),expect.any(String))
        expect(result).toEqual({ok:true})
    })
 
    it('should fail on exception', async() => {
        usersRepository.findOne.mockRejectedValue(new Error("에러"))
        const result = await service.createAccount(createAccountArgs)
        expect(result).toEqual({ ok: false, error: "Couldn't create account"})
        
    })
   })

   describe("login", () => {
       const loginArgs = {
           email: "test@email.com",
           password: "test"
       }
        it("should fail if user does not exist", async () => {
            usersRepository.findOne.mockResolvedValue(null);

            const result = await service.login(loginArgs)

            expect(usersRepository.findOne).toHaveBeenCalledTimes(1)
            expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object))
            expect(result).toEqual({
                ok: false,
                error: "User not found"
            })
        })
        
        it("should fail if the password is wrong", async() => {
            const mockedUser = {
                id: 1,
                checkPassword: jest.fn(() => Promise.resolve(false))
            }
            usersRepository.findOne.mockResolvedValue(mockedUser)
            const result = await service.login(loginArgs)
            expect(result).toEqual({
                ok: false,
                error: "Wrong Password"
            })
        })

        it("should return token if password correct", async() => {
            const mockedUser = {
                id: 1,
                checkPassword: jest.fn(() => Promise.resolve(true))
            }
            usersRepository.findOne.mockResolvedValue(mockedUser)
            const result = await service.login(loginArgs)
            console.log(result)
            expect(jwtService.sign).toHaveBeenCalledTimes(1)
            expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number))
            // expect(result).toEqual()
        })
    }
    )
    it.todo('login')
    it.todo('findById')
    it.todo('editProfile')
    it.todo('verifyEmail')
})