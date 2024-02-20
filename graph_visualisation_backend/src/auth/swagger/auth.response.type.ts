import { ApiProperty } from "@nestjs/swagger";

// Define a class representing the return object
export class AuthResponse {
    @ApiProperty()
    token: string;
}