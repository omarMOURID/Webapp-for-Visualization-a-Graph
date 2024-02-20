import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import { ApiProperty } from '@nestjs/swagger'; // Import necessary decorators

/**
 * Data transfer object (DTO) for user signup.
 */
export class SignUpDto {
    /** The first name of the user. */
    @ApiProperty({ 
        type: String,
        required: true,
        description: 'The first name of the user' 
    })
    @IsString()
    @IsNotEmpty()
    firstname: string;

    /** The last name of the user. */
    @ApiProperty({ 
        type: String,
        required: true,
        description: 'The last name of the user' 
    })
    @IsString()
    @IsNotEmpty()
    lastname: string;

    /** The email address of the user. */
    @ApiProperty({ 
        type: String, 
        format: 'email', 
        description: 'The email address of the user.', 
        required: true })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    /**
     * The password of the user. 
     * Must be at least 8 characters long, containing at least 1 lowercase letter, 
     * 1 uppercase letter, and 1 number.
     */
    @ApiProperty({ 
        type: String,
        format: "password",
        required: true,
        description: 'The password of the user' 
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
        format: "password",
        required: true,
        description: 'The confirmation of the password' 
    })
    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}
