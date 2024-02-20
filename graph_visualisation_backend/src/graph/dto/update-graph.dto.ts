import { IsBoolean, IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Data transfer object (DTO) for updating a graph.
 * Fields:
 * - title: The new title of the graph. Required if description and isVisible are not provided.
 * - description: The new description of the graph. Required if title and isVisible are not provided.
 * - isVisible: The new visibility status of the graph. Required if title and description are not provided.
 */
export class UpdateGraphDto {

    @ApiProperty({
        type: String,
        description: 'The new title of the graph. Required if description and isVisible are not provided.',
        required: false
    })
    @IsString()
    @ValidateIf(o => !o.description && (o.isVisible === undefined))
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        type: String,
        description: 'The new description of the graph. Required if title and isVisible are not provided.',
        required: false
    })
    @IsString()
    @ValidateIf(o => !o.title && (o.isVisible === undefined))
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        type: Boolean,
        description: 'The new visibility status of the graph. Required if title and description are not provided.',
        required: false
    })
    @IsBoolean()
    @ValidateIf(o => !o.title && !o.description)
    @IsNotEmpty()
    isVisible: boolean;
}
