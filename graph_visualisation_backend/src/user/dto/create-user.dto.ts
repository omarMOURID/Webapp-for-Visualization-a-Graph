import { IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import { UserRole } from "../user.entity";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Data transfer object (DTO) for user signup.
 * Contains the necessary fields to create a new user.
 */
export class CreateUserDto {
    /** The first name of the user. */
    @ApiProperty({ 
        type: String, 
        description: 'The first name of the user.', 
        required: true 
    })
    @IsString()
    @IsNotEmpty()
    firstname: string;

    /** The last name of the user. */
    @ApiProperty({ 
        type: String, 
        description: 'The last name of the user.', 
        required: true 
    })
    @IsString()
    @IsNotEmpty()
    lastname: string;

    /** The email address of the user. */
    @ApiProperty({ 
        type: String, 
        format: 'email', 
        description: 'The email address of the user.', 
        required: true 
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    /** The role of the user (e.g., USER or ADMIN). */
    @ApiProperty({
        type: String, 
        enum: UserRole, 
        description: 'The role of the user (e.g., user or admin).', 
        required: true 
    })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;

    /**
     * The password of the user. 
     * Must be at least 8 characters long, containing at least 1 lowercase letter, 
     * 1 uppercase letter, and 1 number.
     */
    @ApiProperty({ 
        type: String, 
        format: 'password', 
        minLength: 8, 
        description: 'The password of the user.', 
        required: true 
    })
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,   
    })
    @IsNotEmpty()
    password: string;

    /** The confirmation of the password. */
    @ApiProperty({ 
        type: String, 
        format: 'password', 
        description: 'The confirmation of the password.', 
        required: true 
    })
    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}
