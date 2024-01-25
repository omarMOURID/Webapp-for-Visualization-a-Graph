import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateGraphDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description: string;
}