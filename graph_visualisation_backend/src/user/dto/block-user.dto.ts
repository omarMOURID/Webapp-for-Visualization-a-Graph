import { IsBoolean, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { boolean } from "joi";

/**
 * Data transfer object (DTO) for user block.
 * Contains the necessary fields to block a user.
 */
export class BlockUserDto {
    /** The first name of the user. */
    @ApiProperty({ 
        type: Boolean, 
        description: 'The value define if the user will be blocked.', 
        required: true 
    })
    @IsBoolean()
    @IsNotEmpty()
    blocked: boolean;
}
