import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { Label, Relation } from '../graph.types';

/**
 * Data transfer object (DTO) for querying graphs.
 * Fields:
 * - labels: An array of labels to filter nodes by. (optional)
 * - relations: An array of relations to filter nodes by. (optional)
 * - node: The node to query. (optional)
 * - pmcid: The PMC ID associated with the query. (optional, required if sentenceid is provided)
 * - sentenceid: The sentence ID associated with the query. (optional)
 */
export class QueryGraphDto {
    @IsEnum(Label, { each: true }) // Validate each label in the array
    @IsOptional()
    labels: Label[];

    @IsEnum(Relation, { each: true }) // Validate each relation in the array
    @IsOptional()
    relations: Relation[];

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    node: string;

    @IsString()
    @IsNotEmpty()
    @ValidateIf(o => o.sentenceid)
    pmcid: string;

    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    sentenceid: number;
}
