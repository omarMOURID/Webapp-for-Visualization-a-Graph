import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

/**
 * Service responsible for handling authentication related operations.
 */
@Injectable()
export class AuthService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly jwtService: JwtService
    ) {}

    /**
     * Registers a new user.
     * @param signUpDto The data required to sign up a user.
     * @returns An object containing the JWT token.
     */
    async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
        try {
            const { firstname, lastname, email, password, confirmPassword } = signUpDto;

            // Check if new password and confirm password match
            if (password !== confirmPassword) {
                throw new BadRequestException("Passwords do not match.");
            }

            // Generate a salt and hash the password
            const passwordSalt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, passwordSalt);

            // Create a new user entity
            const user = new User({
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: hashedPassword,
                passwordSalt: passwordSalt
            });

            // Save the user to the database
            await this.entityManager.save(user);

            // Generate JWT token with user details
            const token = this.jwtService.sign({
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.roles
            });

            return { token };
        } catch(error) {
            // Handle specific error types, e.g., unique constraint violation
            if (error.code === "ER_DUP_ENTRY") {
                throw new ConflictException('Email already exists');
            }
            // Handle other errors or rethrow
            throw error;
        }
        
    }

    /**
     * Logs in a user.
     * @param loginDto The data required to log in a user.
     * @returns An object containing the JWT token.
     * @throws UnauthorizedException If the provided email or password is invalid.
     */
    async login(loginDto: LoginDto): Promise<{ token: string }> {
        const { email, password } = loginDto;
        
        // Find the user by email
        const user = await this.entityManager.findOneBy(User, { email });

        // If user is not found, throw an exception
        if (!user) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // If user is blocked, throw an exception
        if (user.blocked === true) {
            throw new UnauthorizedException("Access Denied");
        }

        // Compare the provided password with the hashed password stored in the database
        const passwordIsMatched = await bcrypt.compare(password, user.password);

        // If passwords don't match, throw an exception
        if (!passwordIsMatched) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Generate JWT token with user details
        const token = this.jwtService.sign({
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.roles
        });

        return { token };
    }
}
