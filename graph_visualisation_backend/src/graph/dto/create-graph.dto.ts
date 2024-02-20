import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Data transfer object (DTO) for creating a new graph.
 * Fields:
 * - title: The title of the graph. (required)
 * - description: An optional description of the graph. (optional)
 */
export class CreateGraphDto {

    @ApiProperty({
        type: String,
        description: 'The title of the graph.',
        required: true,
        example: 'Graph 1'
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        type: String,
        description: 'An optional description of the graph.',
        required: false,
        example: 'This graph represents...'
    })
    @IsString()
    @IsOptional()
    description: string;
}
