import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../user.entity";

/**
 * Data transfer object (DTO) for updating user information.
 * Contains optional fields to update user details.
 */
export class UpdateUserDto {
    /** The first name of the user. */
    @ApiProperty({
        type: String,
        description: 'The first name of the user.',
        required: false
    })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    firstname?: string;

    /** The last name of the user. */
    @ApiProperty({
        type: String,
        description: 'The last name of the user.',
        required: false
    })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    lastname?: string;

    /** The role of the user (e.g., USER or ADMIN). */
    @ApiProperty({
        type: String,
        enum: UserRole,
        description: 'The role of the user (e.g., USER or ADMIN).',
        required: false
    })
    @IsEnum(UserRole)
    @IsNotEmpty()
    @IsOptional()
    role?: UserRole;
}
