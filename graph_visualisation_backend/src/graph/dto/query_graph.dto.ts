import { IsEnum, IsOptional } from 'class-validator';
import { Label, Relation } from '../graph.types';

export class QueryGraphDto {
  @IsEnum(Label, { each: true }) // Validate each label in the array
  @IsOptional()
  labels: Label[];

  @IsEnum(Relation, { each: true }) // Validate each relation in the array
  @IsOptional()
  relations: Relation[];
}