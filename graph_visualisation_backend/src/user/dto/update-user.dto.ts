import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UserRole } from "../user.entity";

/**
 * Data transfer object (DTO) for updating user information.
 * Contains optional fields to update user details.
 */
export class UpdateUserDto {
    /** The first name of the user. */
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    // Optional field for updating first name
    firstname?: string;

    /** The last name of the user. */
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    // Optional field for updating last name
    lastname?: string;

    /** The role of the user (e.g., USER or ADMIN). */
    @IsEnum(UserRole)
    @IsNotEmpty()
    @IsOptional()
    // Optional field for updating user role
    role?: UserRole;
}
