import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Data transfer object (DTO) for updating user password.
 * Contains fields for the old password, new password, and confirmation.
 */
export class UpdatePasswordDto {
    /** The user's old password. */
    @ApiProperty({ 
        type: String,
        description: 'The user\'s old password.',
        format: 'password',
        required: true
    })
    @IsString()
    @IsNotEmpty()
    oldPassword: string;

    /**
     * The user's new password.
     * Must meet certain complexity requirements.
     */
    @ApiProperty({ 
        type: String, 
        description: 'The user\'s new password. Must be at least 8 characters long, containing at least 1 lowercase letter, 1 uppercase letter, and 1 number.',
        format: 'password',
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

    /** The confirmation of the new password. */
    @ApiProperty({ 
        type: String,
        description: 'The confirmation of the new password.',
        format: 'password',
        required: true
    })
    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}
