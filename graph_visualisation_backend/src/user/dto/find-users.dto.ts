import { IsInt, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Data transfer object (DTO) for finding users with pagination.
 * Contains parameters for pagination.
 */
export class FindUsersDto {

    /** The page number for pagination. */
    @ApiProperty({ type: Number, description: 'The page number for pagination.', required: false, default: 1 })
    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    page?: number = 1;

    /** The number of items per page for pagination. */
    @ApiProperty({ type: Number, description: 'The number of items per page for pagination.', required: false, default: 10 })
    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    size?: number = 10;
}
