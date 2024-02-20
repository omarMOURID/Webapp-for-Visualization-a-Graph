import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
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

    @ApiProperty({
        type: String,
        isArray: true,
        enum: Label,
        description: 'An array of labels to filter nodes by.',
        required: false
    })
    @IsEnum(Label, { each: true })
    @IsOptional()
    labels: Label[];

    @ApiProperty({
        type: String,
        isArray: true,
        enum: Relation,
        description: 'An array of relations to filter nodes by.',
        required: false
    })
    @IsEnum(Relation, { each: true })
    @IsOptional()
    relations: Relation[];

    @ApiProperty({
        type: String,
        description: 'The node to query.',
        required: false
    })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    node: string;

    @ApiProperty({
        type: String,
        description: 'The PMC ID associated with the query. Required if sentenceid is provided.',
        required: false
    })
    @IsString()
    @IsNotEmpty()
    @ValidateIf(o => o.sentenceid)
    pmcid: string;

    @ApiProperty({
        type: Number,
        description: 'The sentence ID associated with the query.',
        required: false
    })
    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    sentenceid: number;
}
