import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger'; // Import necessary decorators
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { object } from 'joi';
import { AuthResponse } from './swagger/auth.response.type';

@ApiTags('auth') // Tag the controller with 'auth' for Swagger documentation
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
    @ApiOperation({ summary: 'User registration (sign up)' }) // Add operation summary
    @ApiBody({ type: SignUpDto }) // Specify the DTO type for request body
    @ApiResponse({ type: AuthResponse, status: 201, description: 'Returns an object containing a JWT token upon successful registration.' }) // Specify the response status and description
    @Post("/signup")
    async signUp(@Body() signUpDto: SignUpDto): Promise<{token: string}> {
        return await this.authService.signUp(signUpDto);
    } 

    /**
     * Endpoint for user login.
     * @param loginDto Data for user login.
     * @returns An object containing a JWT token upon successful login.
     */
    @ApiOperation({ summary: 'User login' }) // Add operation summary
    @ApiBody({ type: LoginDto }) // Specify the DTO type for request body
    @ApiResponse({type: AuthResponse, status: 200, description: 'Returns an object containing a JWT token upon successful login.' }) // Specify the response status and description
    @Post("/login") 
    async login(@Body() loginDto: LoginDto): Promise<{token: string}> {
        return await this.authService.login(loginDto);
    }
}
