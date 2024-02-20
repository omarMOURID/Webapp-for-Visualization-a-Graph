import { IsInt, IsNotEmpty, IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object (DTO) for finding graphs.
 * Fields:
 * - page: The page number for pagination. (optional, default: 1)
 * - size: The number of items per page for pagination. (optional, default: 10)
 * - includeNonVisible: Indicates whether to include non-visible graphs in the results. (optional, default: false)
 * - search: A search query to filter graphs. (optional)
 */
export class FindGraphsDto {

    @ApiProperty({
        type: Number,
        description: 'The page number for pagination.',
        required: false,
        default: 1
    })
    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    page?: number = 1;

    @ApiProperty({
        type: Number,
        description: 'The number of items per page for pagination.',
        required: false,
        default: 10
    })
    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    size?: number = 10;

    @ApiProperty({
        type: Boolean,
        description: 'Indicates whether to include non-visible graphs in the results.',
        required: false,
        default: false
    })
    @IsBoolean()
    @IsNotEmpty()
    @IsOptional()
    includeNonVisible?: boolean = false;

    @ApiProperty({
        type: String,
        description: 'A search query to filter graphs (graph titles).',
        required: false
    })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    search?: string;
}
