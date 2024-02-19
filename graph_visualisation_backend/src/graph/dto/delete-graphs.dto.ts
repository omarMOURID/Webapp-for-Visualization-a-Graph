import { IsArray, IsNotEmpty, IsString } from "class-validator";

/**
 * Data transfer object (DTO) for deleting graphs.
 * Fields:
 * - ids: An array of strings representing the IDs of the graphs to delete.
 */
export class DeleteGraphsDto {
    // An array of strings representing the IDs of the graphs to delete.
    @IsArray()
    @IsString({each: true})
    @IsNotEmpty()
    ids: string[];
}