import { IsInt, IsNotEmpty, IsOptional, IsBoolean, IsString } from 'class-validator';

/**
 * Data transfer object (DTO) for finding graphs.
 * Fields:
 * - page: The page number for pagination. (optional, default: 1)
 * - size: The number of items per page for pagination. (optional, default: 10)
 * - includeNonVisible: Indicates whether to include non-visible graphs in the results. (optional, default: false)
 * - search: A search query to filter graphs. (optional)
 */
export class FindGraphsDto {

    // The page number for pagination.
    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    page?: number = 1;

    // The number of items per page for pagination.
    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    size?: number = 10;

    // Indicates whether to include non-visible graphs in the results.
    @IsBoolean()
    @IsNotEmpty()
    @IsOptional()
    includeNonVisible?: boolean = false;

    // A search query to filter graphs.
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    search?: string;
}
