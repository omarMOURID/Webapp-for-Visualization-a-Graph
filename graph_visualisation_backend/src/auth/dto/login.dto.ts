import { IsEmail, IsNotEmpty, IsString } from "class-validator";

/**
 * Data transfer object (DTO) for user login.
 */
export class LoginDto {
    /** The email address of the user. */
    @IsEmail()
    @IsNotEmpty()
    email: string;

    /** The password of the user. */
    @IsString()
    @IsNotEmpty()
    password: string;
}
