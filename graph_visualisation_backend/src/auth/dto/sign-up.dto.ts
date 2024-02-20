import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

/**
 * Data transfer object (DTO) for user signup.
 */
export class SignUpDto {
    /** The first name of the user. */
    @IsString()
    @IsNotEmpty()
    firstname: string;

    /** The last name of the user. */
    @IsString()
    @IsNotEmpty()
    lastname: string;

    /** The email address of the user. */
    @IsEmail()
    @IsNotEmpty()
    email: string;

    /**
     * The password of the user. 
     * Must be at least 8 characters long, containing at least 1 lowercase letter, 
     * 1 uppercase letter, and 1 number.
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
