import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../user/user.entity";
import { EntityManager, Repository } from "typeorm";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly entityManager: EntityManager,
    ) {
        // Call the constructor of the parent class (Strategy) with options for JWT authentication
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT token from Authorization header
            ignoreExpiration: false, // Reject expired tokens
            secretOrKey: process.env.JWT_SECRET, // Secret key for decoding the JWT token
        });
    }

    /**
     * Validates the JWT payload and retrieves the corresponding user.
     * @param payload The payload extracted from the JWT token.
     * @returns The user associated with the JWT token.
     * @throws UnauthorizedException If the user is not found.
     */
    async validate(payload: any) {
        const { id } = payload;

        // Find the user by ID in the database
        const user = await this.entityManager.findOneBy(User, { id });

        // If user is not found, throw an unauthorized exception
        if (!user) {
            throw new UnauthorizedException("Login first to access this endpoint");
        }

        // Return the found user
        return user;
    }
}
