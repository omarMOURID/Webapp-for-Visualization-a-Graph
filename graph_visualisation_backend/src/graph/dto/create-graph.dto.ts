import { IsNotEmpty, IsOptional, IsString } from "class-validator";

/**
 * Data transfer object (DTO) for creating a new graph.
 * Fields:
 * - title: The title of the graph. (required)
 * - description: An optional description of the graph. (optional)
 */
export class CreateGraphDto {

    // The title of the graph.
    @IsString()
    @IsNotEmpty()
    title: string;

    // An optional description of the graph.
    @IsString()
    @IsOptional()
    description: string;
}
