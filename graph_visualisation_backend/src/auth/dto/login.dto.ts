import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger'; // Import necessary decorators

/**
 * Data transfer object (DTO) for user login.
 */
export class LoginDto {
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

    /** The password of the user. */
    @ApiProperty({ 
        type: String,
        format: "password",
        required: true,
        description: 'The password of the user' 
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}
