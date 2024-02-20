import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

/**
 * Data transfer object (DTO) for updating user password.
 * Contains fields for the old password, new password, and confirmation.
 */
export class UpdatePasswordDto {
    /** The user's old password. */
    @IsString()
    @IsNotEmpty()
    oldPassword: string;

    /**
     * The user's new password.
     * Must meet certain complexity requirements.
     */
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
    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}
