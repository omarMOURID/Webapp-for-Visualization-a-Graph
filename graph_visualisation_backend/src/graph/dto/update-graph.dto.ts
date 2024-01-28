import { IsBoolean, IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class updateGraphDto {
    @IsString()
    @ValidateIf(o => !o.description && (o.isVisible == undefined))
    @IsNotEmpty()
    title: string;

    @IsString()
    @ValidateIf(o => !o.title && (o.isVisible == undefined))
    @IsNotEmpty()
    description: string;

    @IsBoolean()
    @ValidateIf(o => !o.title && !o.description)
    @IsNotEmpty()
    isVisible: boolean;
}