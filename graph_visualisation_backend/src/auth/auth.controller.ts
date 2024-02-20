import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    /**
     * Endpoint for user registration (sign up).
     * @param signUpDto Data for user registration.
     * @returns An object containing a JWT token upon successful registration.
     */
    @Post("/signup")
    async signUp(@Body() signUpDto: SignUpDto): Promise<{token: string}> {
        return await this.authService.signUp(signUpDto);
    } 

    /**
     * Endpoint for user login.
     * @param loginDto Data for user login.
     * @returns An object containing a JWT token upon successful login.
     */
    @Get("/login") 
    async login(@Body() loginDto: LoginDto): Promise<{token: string}> {
        return await this.authService.login(loginDto);
    }
}
