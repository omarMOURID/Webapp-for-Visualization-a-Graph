import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../user/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    /**
     * Checks if the user has the required roles to access the endpoint.
     * @param context The execution context.
     * @returns A boolean indicating whether the user has the required roles.
     */
    canActivate(context: ExecutionContext): boolean {
        // Get the roles associated with the endpoint from metadata
        const roles = this.reflector.get<UserRole[]>("roles", context.getHandler());

        // If no roles are specified for the endpoint, access is granted by default
        if (!roles) {
            return true;
        }

        // Extract the user object from the request
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Check if the user's roles match any of the required roles
        return this.matchRoles(roles, user.roles);
    }

    /**
     * Checks if the user's roles match any of the required roles.
     * @param roles The required roles for accessing the endpoint.
     * @param userRoles The roles of the user.
     * @returns A boolean indicating whether the user's roles match any of the required roles.
     */
    matchRoles(roles: UserRole[], userRoles: UserRole): boolean {
        return roles.includes(userRoles);
    }
}
