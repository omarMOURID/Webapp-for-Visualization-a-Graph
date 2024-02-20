import { IsInt, IsNotEmpty, IsOptional } from "class-validator";

/**
 * Data transfer object (DTO) for finding users with pagination.
 * Contains parameters for pagination.
 */
export class FindUsersDto {

    /** The page number for pagination. */
    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    // The default value is 1 if not provided
    page?: number = 1;

    /** The number of items per page for pagination. */
    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    // The default value is 10 if not provided
    size?: number = 10;
}
