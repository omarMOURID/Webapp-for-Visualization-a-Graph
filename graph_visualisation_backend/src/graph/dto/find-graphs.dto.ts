import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, isInt } from "class-validator";

export class FindGraphsDto {
    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    page?: number = 1;

    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    size?: number = 10;

    @IsBoolean()
    @IsNotEmpty()
    @IsOptional()
    includeNonVisible?: boolean = false;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    search?: string;
}