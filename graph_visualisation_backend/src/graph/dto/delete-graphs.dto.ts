import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Data transfer object (DTO) for deleting graphs.
 * Fields:
 * - ids: An array of strings representing the IDs of the graphs to delete.
 */
export class DeleteGraphsDto {

    @ApiProperty({
        type: [String],
        isArray: true,
        description: 'An array of strings representing the IDs of the graphs to delete.',
        example: ['graphId1', 'graphId2']
    })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    ids: string[];
}
