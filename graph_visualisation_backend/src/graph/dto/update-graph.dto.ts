import { IsBoolean, IsNotEmpty, IsString, ValidateIf } from "class-validator";

/**
 * Data transfer object (DTO) for updating a graph.
 * Fields:
 * - title: The new title of the graph. Required if description and isVisible are not provided.
 * - description: The new description of the graph. Required if title and isVisible are not provided.
 * - isVisible: The new visibility status of the graph. Required if title and description are not provided.
 */
export class UpdateGraphDto {
    // The new title of the graph.
    @IsString()
    @ValidateIf(o => !o.description && (o.isVisible === undefined))
    @IsNotEmpty()
    title: string;

    // The new description of the graph.
    @IsString()
    @ValidateIf(o => !o.title && (o.isVisible === undefined))
    @IsNotEmpty()
    description: string;

    // The new visibility status of the graph.
    @IsBoolean()
    @ValidateIf(o => !o.title && !o.description)
    @IsNotEmpty()
    isVisible: boolean;
}
